"""
train_leaf_gate.py
===================

Leaf vs Not-Leaf GATE model. Runs BEFORE the main pipeline (patch splitting +
5-class disease classifier) to reject images that are not photos of leaves at
all (e.g. user accidentally uploads an ID photo, a selfie, food, etc.), so the
system doesn't waste compute on splitting + inference for garbage input.

This model is completely separate from the 5 disease-classifier models built
previously. It is intentionally lightweight (MobileNetV2) because it is a
"gate" called on every single request, before the expensive part of the
pipeline.

Framework : PyTorch
Device    : RTX 5050 8GB VRAM / 16GB RAM (also runs fine on CPU, just slower)

--------------------------------------------------------------------------
BAGIAN 1 — Dataset Preparation
--------------------------------------------------------------------------
`prepare_leaf_gate_dataset()` builds a flat binary-classification folder:

    output_dir/
        leaf/       *.jpg   (label 0)
        not_leaf/   *.jpg   (label 1)

Positive class ("leaf"):
    - PlantVillage-style directory containing multiple disease-class
      subfolders (segmented or raw-background versions). ALL subfolders are
      walked recursively; every image found is treated as "leaf" regardless
      of which disease subfolder it lives in.

Negative class ("not_leaf"):
    - Tiny-ImageNet-200 style directory (train/ + val/ subfolders with class
      folders / images subfolders). ALL images under both `train` and `val`
      are discovered via os.walk (this is agnostic to the exact Tiny-ImageNet
      internal layout, e.g. train/<wnid>/images/*.JPEG or val/images/*.JPEG),
      then randomly subsampled — we never load/copy the full ~200k images.

The final dataset root is assumed to have the structure
`dataset_root/{leaf,not_leaf}/*.jpg`. If a different structure is detected,
adjust `LEAF_SUBDIR` / `NOT_LEAF_SUBDIR` below accordingly.
"""

import argparse
import csv
import json
import os
import random
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from PIL import Image, ImageFile
from sklearn.metrics import (
    confusion_matrix,
    precision_recall_fscore_support,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset, Subset
from torchvision import models, transforms

ImageFile.LOAD_TRUNCATED_IMAGES = True

# --------------------------------------------------------------------------
# Constants / conventions (kept consistent with the 5 previous training scripts)
# --------------------------------------------------------------------------
IMG_SIZE = 128  # gate does not need high resolution, unlike the disease classifier
LEAF_SUBDIR = "leaf"
NOT_LEAF_SUBDIR = "not_leaf"
CLASS_NAMES = [LEAF_SUBDIR, NOT_LEAF_SUBDIR]  # leaf=0, not_leaf=1 (alphabetical, matches ImageFolder)
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG", ".bmp", ".BMP"}

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Default project paths (Sarah's local machine) — can be overridden via CLI.
DEFAULT_LEAF_DIR = r"C:\Users\Sarah\Annotation-ML-Leaf-New\dataset_filtered\raw\segmented"
DEFAULT_NEGATIVE_DIR = r"C:\Users\Sarah\Annotation-ML-Leaf-New\tiny-imagenet-200"


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


# ==========================================================================
# BAGIAN 1 — Dataset preparation
# ==========================================================================
def _collect_images(root: str):
    """Recursively walk `root` and return every image file path found."""
    found = []
    for dirpath, _dirnames, filenames in os.walk(root):
        for fname in filenames:
            if Path(fname).suffix in IMAGE_EXTS:
                found.append(os.path.join(dirpath, fname))
    return found


def prepare_leaf_gate_dataset(
    leaf_dir: str,
    negative_sources,
    output_dir: str,
    samples_per_class: int = 5000,
    img_size: int = IMG_SIZE,
    seed: int = 42,
):
    """
    Build `output_dir/{leaf,not_leaf}/*.jpg` from raw source directories.

    leaf_dir           : PlantVillage-style root (traversed recursively,
                          all disease subfolders merged into a single
                          "leaf" pool, then randomly subsampled).
    negative_sources    : list of directories (e.g. [tiny_imagenet_root]) to
                          walk recursively for "not_leaf" candidates. Every
                          negative source is pooled together before sampling.
    output_dir          : destination root, will contain leaf/ and not_leaf/.
    samples_per_class   : cap on how many images to sample per class. Random
                          sampling is used — NOT every available image is
                          copied if more are available than requested
                          (this matters a lot for Tiny-ImageNet, which has
                          ~200k images and must never be loaded in full).
    """
    random.seed(seed)
    out_leaf = Path(output_dir) / LEAF_SUBDIR
    out_not_leaf = Path(output_dir) / NOT_LEAF_SUBDIR
    out_leaf.mkdir(parents=True, exist_ok=True)
    out_not_leaf.mkdir(parents=True, exist_ok=True)

    # ---- positive (leaf) ----
    print(f"[prepare] scanning leaf source: {leaf_dir}")
    leaf_pool = _collect_images(leaf_dir)
    print(f"[prepare] found {len(leaf_pool)} candidate leaf images")
    if len(leaf_pool) > samples_per_class:
        leaf_pool = random.sample(leaf_pool, samples_per_class)
    else:
        print(
            f"[prepare] WARNING: only {len(leaf_pool)} leaf images available, "
            f"fewer than requested samples_per_class={samples_per_class}"
        )

    # ---- negative (not_leaf) ----
    if isinstance(negative_sources, str):
        negative_sources = [negative_sources]
    neg_pool = []
    for src in negative_sources:
        print(f"[prepare] scanning negative source: {src}")
        found = _collect_images(src)
        print(f"[prepare]   found {len(found)} candidate images under {src}")
        neg_pool.extend(found)
    print(f"[prepare] total negative candidate pool: {len(neg_pool)}")
    if len(neg_pool) > samples_per_class:
        neg_pool = random.sample(neg_pool, samples_per_class)
    else:
        print(
            f"[prepare] WARNING: only {len(neg_pool)} negative images available, "
            f"fewer than requested samples_per_class={samples_per_class}"
        )

    def _resize_and_save(src_path, dst_path):
        try:
            img = Image.open(src_path).convert("RGB")
            img = img.resize((img_size, img_size), Image.BILINEAR)
            img.save(dst_path, format="JPEG", quality=90)
            return True
        except Exception as e:  # noqa: BLE001 - keep dataset prep resilient to bad files
            print(f"[prepare]   skipped unreadable file {src_path}: {e}")
            return False

    n_leaf_saved = 0
    for i, p in enumerate(leaf_pool):
        if _resize_and_save(p, out_leaf / f"leaf_{i:06d}.jpg"):
            n_leaf_saved += 1

    n_neg_saved = 0
    for i, p in enumerate(neg_pool):
        if _resize_and_save(p, out_not_leaf / f"not_leaf_{i:06d}.jpg"):
            n_neg_saved += 1

    print("=" * 60)
    print("[prepare] Dataset preparation complete")
    print(f"[prepare]   leaf      : {n_leaf_saved} images -> {out_leaf}")
    print(f"[prepare]   not_leaf  : {n_neg_saved} images -> {out_not_leaf}")
    print(f"[prepare]   ratio leaf:not_leaf = 1:{n_neg_saved / max(n_leaf_saved, 1):.2f}")
    print("=" * 60)
    return str(output_dir)


# ==========================================================================
# BAGIAN 2 — Preprocessing / Dataset class
# ==========================================================================
def get_transforms(train: bool, img_size: int = IMG_SIZE):
    if train:
        return transforms.Compose(
            [
                transforms.Resize((img_size, img_size)),
                transforms.RandomHorizontalFlip(),
                transforms.RandomRotation(15),
                transforms.ColorJitter(brightness=0.25, contrast=0.25),
                transforms.ToTensor(),
                transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
            ]
        )
    return transforms.Compose(
        [
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        ]
    )


class LeafGateFolder(Dataset):
    """Thin wrapper over dataset_root/{leaf,not_leaf}/*.jpg with label leaf=0, not_leaf=1."""

    def __init__(self, dataset_root: str, transform=None):
        self.samples = []
        for label_idx, cls in enumerate(CLASS_NAMES):
            cls_dir = Path(dataset_root) / cls
            if not cls_dir.is_dir():
                raise FileNotFoundError(
                    f"Expected folder '{cls}' under {dataset_root}, found none. "
                    f"Dataset root must have structure dataset_root/{{leaf,not_leaf}}/*.jpg"
                )
            for f in sorted(cls_dir.iterdir()):
                if f.suffix in IMAGE_EXTS:
                    self.samples.append((str(f), label_idx))
        if not self.samples:
            raise RuntimeError(f"No images found under {dataset_root}")
        self.transform = transform
        self.targets = [s[1] for s in self.samples]

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label


def build_train_val_datasets(dataset_root: str, seed: int = 42, img_size: int = IMG_SIZE):
    """Stratified 80/20 split, train and val get different transforms."""
    base = LeafGateFolder(dataset_root, transform=None)
    indices = list(range(len(base)))
    train_idx, val_idx = train_test_split(
        indices, test_size=0.2, random_state=seed, stratify=base.targets
    )

    train_full = LeafGateFolder(dataset_root, transform=get_transforms(True, img_size))
    val_full = LeafGateFolder(dataset_root, transform=get_transforms(False, img_size))

    train_ds = Subset(train_full, train_idx)
    val_ds = Subset(val_full, val_idx)
    train_labels = [base.targets[i] for i in train_idx]
    val_labels = [base.targets[i] for i in val_idx]
    return train_ds, val_ds, train_labels, val_labels


# ==========================================================================
# BAGIAN 3 — Model
# ==========================================================================
def build_model():
    model = models.mobilenet_v2(weights="IMAGENET1K_V1")
    in_features = model.classifier[1].in_features
    # 2-way softmax head (leaf=0, not_leaf=1) rather than single-sigmoid output,
    # since CrossEntropyLoss + softmax gives us both class probabilities
    # directly for the confidence-threshold calibration in BAGIAN 4.
    model.classifier[1] = nn.Linear(in_features, 2)
    return model


def set_backbone_trainable(model, trainable: bool):
    for p in model.features.parameters():
        p.requires_grad = trainable


# ==========================================================================
# Training / evaluation loops
# ==========================================================================
def run_epoch(model, loader, criterion, optimizer, device, scaler, train: bool):
    model.train() if train else model.eval()
    total_loss, total_correct, total_n = 0.0, 0, 0

    torch.set_grad_enabled(train)
    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.to(device)
        if train:
            optimizer.zero_grad()

        with torch.cuda.amp.autocast(enabled=(device.type == "cuda")):
            outputs = model(imgs)
            loss = criterion(outputs, labels)

        if train:
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

        preds = outputs.argmax(dim=1)
        total_loss += loss.item() * imgs.size(0)
        total_correct += (preds == labels).sum().item()
        total_n += imgs.size(0)

    return total_loss / total_n, total_correct / total_n


def train_model(model, train_loader, val_loader, class_weights, device, args):
    model.to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    scaler = torch.cuda.amp.GradScaler(enabled=(device.type == "cuda"))

    logs_dir = Path(args.output_dir) / "logs"
    ckpt_dir = Path(args.output_dir) / "checkpoints"
    logs_dir.mkdir(parents=True, exist_ok=True)
    ckpt_dir.mkdir(parents=True, exist_ok=True)

    log_path = logs_dir / "training_log.csv"
    with open(log_path, "w", newline="") as f:
        csv.writer(f).writerow(["epoch", "train_loss", "train_acc", "val_loss", "val_acc", "lr"])

    # Phase 1: freeze backbone, train classifier head only.
    set_backbone_trainable(model, False)
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)

    best_val_loss = float("inf")
    epochs_no_improve = 0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    best_path = ckpt_dir / "best_model.pt"
    start_time = time.time()

    for epoch in range(1, args.epochs + 1):
        # Unfreeze the whole backbone after the freeze warmup and rebuild the
        # optimizer with a small learning rate for fine-tuning.
        if epoch == args.freeze_epochs + 1:
            print(f"[train] epoch {epoch}: unfreezing backbone, switching to lr=1e-4")
            set_backbone_trainable(model, True)
            optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)

        train_loss, train_acc = run_epoch(model, train_loader, criterion, optimizer, device, scaler, train=True)
        val_loss, val_acc = run_epoch(model, val_loader, criterion, optimizer, device, scaler, train=False)

        current_lr = optimizer.param_groups[0]["lr"]
        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        with open(log_path, "a", newline="") as f:
            csv.writer(f).writerow([epoch, train_loss, train_acc, val_loss, val_acc, current_lr])

        print(
            f"[train] epoch {epoch:02d}/{args.epochs} "
            f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.4f} lr={current_lr:.1e}"
        )

        # Early stopping monitored on val_loss.
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            epochs_no_improve = 0
            torch.save(model.state_dict(), best_path)
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= args.patience:
                print(f"[train] early stopping at epoch {epoch} (patience={args.patience})")
                break

    total_time = time.time() - start_time
    model.load_state_dict(torch.load(best_path, map_location=device))
    plot_learning_curve(history, Path(args.output_dir) / "logs" / "learning_curve.png")
    return model, history, total_time, best_val_loss


def plot_learning_curve(history, out_path):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    epochs = range(1, len(history["train_loss"]) + 1)
    fig, axes = plt.subplots(1, 2, figsize=(11, 4))
    axes[0].plot(epochs, history["train_loss"], label="train_loss")
    axes[0].plot(epochs, history["val_loss"], label="val_loss")
    axes[0].set_title("Loss")
    axes[0].set_xlabel("epoch")
    axes[0].legend()

    axes[1].plot(epochs, history["train_acc"], label="train_acc")
    axes[1].plot(epochs, history["val_acc"], label="val_acc")
    axes[1].set_title("Accuracy")
    axes[1].set_xlabel("epoch")
    axes[1].legend()

    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    plt.close(fig)


# ==========================================================================
# BAGIAN 4 — Confidence calibration & threshold selection
# ==========================================================================
@torch.no_grad()
def collect_val_predictions(model, val_loader, device):
    model.eval()
    all_labels, all_probs_leaf, all_preds = [], [], []
    for imgs, labels in val_loader:
        imgs = imgs.to(device)
        logits = model(imgs)
        probs = torch.softmax(logits, dim=1).cpu().numpy()
        preds = probs.argmax(axis=1)
        all_probs_leaf.extend(probs[:, 0].tolist())  # P(leaf), leaf is class index 0
        all_labels.extend(labels.numpy().tolist())
        all_preds.extend(preds.tolist())
    return np.array(all_labels), np.array(all_probs_leaf), np.array(all_preds)


def plot_confidence_distribution(labels, probs_leaf, out_path):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    leaf_scores = probs_leaf[labels == 0]
    not_leaf_scores = probs_leaf[labels == 1]

    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.hist(leaf_scores, bins=30, alpha=0.6, label="true leaf", color="#2E7D32")
    ax.hist(not_leaf_scores, bins=30, alpha=0.6, label="true not_leaf", color="#C62828")
    ax.set_xlabel("P(leaf) softmax confidence")
    ax.set_ylabel("count")
    ax.set_title("Confidence distribution (P(leaf)) by true class")
    ax.legend()
    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    plt.close(fig)


def calibrate_threshold(labels, probs_leaf, ambiguous_margin: float = 0.1):
    """
    Find optimal decision threshold on P(leaf) using ROC + Youden's J statistic.

    y_true is defined as 1 = leaf, 0 = not_leaf (so higher probs_leaf -> more
    likely positive), which matches "how confident is the model that this is
    a leaf" being the score we threshold on.

    False positives here are defined the way that matters operationally for
    the gate: a not_leaf image being let through as "leaf" (i.e. wrongly
    passed on to the expensive downstream pipeline). We therefore look at the
    ROC computed on y_true_leaf = 1 for leaf, 0 for not_leaf, and additionally
    report precision/recall of the "leaf" class at the chosen threshold so the
    false-positive trade-off is explicit in threshold_config.json.
    """
    y_true_leaf = (labels == 0).astype(int)  # 1 if true class is leaf
    fpr, tpr, thresholds = roc_curve(y_true_leaf, probs_leaf)
    j_scores = tpr - fpr
    best_idx = int(np.argmax(j_scores))
    optimal_threshold = float(thresholds[best_idx])
    # roc_curve can return threshold > 1 for the first point; clip to a sane range
    optimal_threshold = float(np.clip(optimal_threshold, 0.01, 0.99))

    preds_leaf_at_threshold = (probs_leaf >= optimal_threshold).astype(int)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true_leaf, preds_leaf_at_threshold, average="binary", zero_division=0
    )

    ambiguous_low = max(0.0, 0.5 - ambiguous_margin)
    ambiguous_high = min(1.0, 0.5 + ambiguous_margin)

    config = {
        "threshold": optimal_threshold,
        "ambiguous_range": [ambiguous_low, ambiguous_high],
        "precision_leaf_at_threshold": float(precision),
        "recall_leaf_at_threshold": float(recall),
        "f1_leaf_at_threshold": float(f1),
        "rationale": (
            "Threshold chosen via ROC curve + Youden's J statistic "
            "(argmax of TPR - FPR) on P(leaf) scores over the validation set. "
            "False positives (not_leaf incorrectly passed through as leaf) are "
            "treated as more costly than false negatives, since they waste "
            "downstream compute and can confuse the user with a nonsensical "
            "disease prediction. An additional ambiguous zone of "
            f"[{ambiguous_low:.2f}, {ambiguous_high:.2f}] around 0.5 is reserved "
            "for rejecting genuinely unclear images instead of forcing a "
            "binary decision."
        ),
    }
    return config


def gate_decision(prob_leaf: float, threshold: float, ambiguous_range):
    """Reference implementation of the 3-way production decision rule."""
    low, high = ambiguous_range
    if low <= prob_leaf <= high:
        return "ambiguous"
    if prob_leaf >= threshold:
        return "leaf"
    return "not_leaf"


# ==========================================================================
# Evaluation (standard metrics @ argmax) + export + benchmark
# ==========================================================================
def evaluate_and_save(model, val_loader, device, args):
    eval_dir = Path(args.output_dir) / "eval"
    eval_dir.mkdir(parents=True, exist_ok=True)

    labels, probs_leaf, preds = collect_val_predictions(model, val_loader, device)

    # Standard metrics at argmax decision (0 = leaf, 1 = not_leaf).
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="macro", zero_division=0
    )
    accuracy = float((preds == labels).mean())
    cm = confusion_matrix(labels, preds, labels=[0, 1])

    tn_leaf_as_leaf, fp_leaf_as_not, fn_not_as_leaf, tp_not_as_not = (
        cm[0, 0],
        cm[0, 1],
        cm[1, 0],
        cm[1, 1],
    )

    metrics = {
        "accuracy": accuracy,
        "precision_macro": float(precision),
        "recall_macro": float(recall),
        "f1_macro": float(f1),
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_labels": CLASS_NAMES,
        "confusion_breakdown": {
            "true_leaf_pred_leaf": int(tn_leaf_as_leaf),
            "true_leaf_pred_not_leaf": int(fp_leaf_as_not),
            "true_not_leaf_pred_leaf": int(fn_not_as_leaf),
            "true_not_leaf_pred_not_leaf": int(tp_not_as_not),
        },
    }
    with open(eval_dir / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    plot_confusion_matrix(cm, eval_dir / "confusion_matrix.png")
    plot_confidence_distribution(labels, probs_leaf, eval_dir / "confidence_distribution.png")

    threshold_config = calibrate_threshold(labels, probs_leaf)
    with open(eval_dir / "threshold_config.json", "w") as f:
        json.dump(threshold_config, f, indent=2)

    return metrics, threshold_config


def plot_confusion_matrix(cm, out_path):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(5, 4.5))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(CLASS_NAMES)
    ax.set_yticklabels(CLASS_NAMES)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center", color="black")
    fig.colorbar(im)
    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    plt.close(fig)


def export_onnx(model, args, device):
    exported_dir = Path(args.output_dir) / "exported"
    exported_dir.mkdir(parents=True, exist_ok=True)
    fp32_path = exported_dir / "model.onnx"
    int8_path = exported_dir / "model_int8.onnx"

    model.eval()
    dummy = torch.randn(1, 3, IMG_SIZE, IMG_SIZE, device=device)
    torch.onnx.export(
        model,
        dummy,
        str(fp32_path),
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
    )

    try:
        from onnxruntime.quantization import QuantType, quantize_dynamic

        quantize_dynamic(str(fp32_path), str(int8_path), weight_type=QuantType.QUInt8)
    except ImportError:
        print(
            "[export] onnxruntime not installed, skipping int8 quantized export. "
            "Install with: pip install onnxruntime"
        )
        int8_path = None

    return fp32_path, int8_path


def benchmark_onnx(path, n_runs: int = 50):
    if path is None or not Path(path).exists():
        return None
    try:
        import onnxruntime as ort
    except ImportError:
        print("[benchmark] onnxruntime not installed, skipping benchmark.")
        return None

    session = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name
    dummy = np.random.randn(1, 3, IMG_SIZE, IMG_SIZE).astype(np.float32)

    # warmup
    for _ in range(5):
        session.run(None, {input_name: dummy})

    times = []
    for _ in range(n_runs):
        t0 = time.perf_counter()
        session.run(None, {input_name: dummy})
        times.append((time.perf_counter() - t0) * 1000.0)
    return float(np.mean(times)), float(np.std(times))


# ==========================================================================
# Main
# ==========================================================================
def main():
    parser = argparse.ArgumentParser(description="Train leaf vs not_leaf gate model")
    parser.add_argument(
        "--dataset_root",
        type=str,
        default="train_model_script/outputs/leaf_gate/dataset",
        help="Root folder with {leaf,not_leaf}/*.jpg. Built automatically if missing.",
    )
    parser.add_argument("--leaf_dir", type=str, default=DEFAULT_LEAF_DIR,
                        help="Raw PlantVillage-style leaf source (only used if dataset_root needs building)")
    parser.add_argument("--negative_dir", type=str, default=DEFAULT_NEGATIVE_DIR,
                        help="Raw Tiny-ImageNet-200 root (only used if dataset_root needs building)")
    parser.add_argument("--samples_per_class", type=int, default=5000)
    parser.add_argument("--force_rebuild_dataset", action="store_true",
                        help="Rebuild dataset_root even if it already exists")
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--freeze_epochs", type=int, default=4)
    parser.add_argument("--patience", type=int, default=6)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-4, help="Fine-tuning lr after unfreeze")
    parser.add_argument("--output_dir", type=str, default="train_model_script/outputs/leaf_gate")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[main] using device: {device}")

    # ---- BAGIAN 1: dataset preparation (skip if already built) ----
    dataset_ready = (
        Path(args.dataset_root, LEAF_SUBDIR).is_dir()
        and Path(args.dataset_root, NOT_LEAF_SUBDIR).is_dir()
        and any(Path(args.dataset_root, LEAF_SUBDIR).iterdir())
    )
    if args.force_rebuild_dataset or not dataset_ready:
        prepare_leaf_gate_dataset(
            leaf_dir=args.leaf_dir,
            negative_sources=[args.negative_dir],
            output_dir=args.dataset_root,
            samples_per_class=args.samples_per_class,
            seed=args.seed,
        )
    else:
        print(f"[main] dataset_root already prepared at {args.dataset_root}, skipping BAGIAN 1")

    # ---- BAGIAN 2: datasets / loaders ----
    train_ds, val_ds, train_labels, val_labels = build_train_val_datasets(
        args.dataset_root, seed=args.seed
    )
    print(f"[main] train size={len(train_ds)} val size={len(val_ds)}")

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)

    # class weights for CrossEntropyLoss, computed on the train split
    counts = np.bincount(train_labels, minlength=2).astype(float)
    class_weights = torch.tensor(counts.sum() / (2.0 * np.clip(counts, 1, None)), dtype=torch.float32)
    print(f"[main] train class counts leaf/not_leaf = {counts.tolist()}, weights={class_weights.tolist()}")

    # ---- BAGIAN 3: model + training ----
    model = build_model()
    model, history, total_train_time, best_val_loss = train_model(
        model, train_loader, val_loader, class_weights, device, args
    )
    best_val_acc = max(history["val_acc"])

    # ---- BAGIAN 4 + BAGIAN 5: eval, confidence calibration, export ----
    metrics, threshold_config = evaluate_and_save(model, val_loader, device, args)
    fp32_path, int8_path = export_onnx(model, args, device)

    fp32_size_mb = Path(fp32_path).stat().st_size / (1024 * 1024)
    int8_size_mb = Path(int8_path).stat().st_size / (1024 * 1024) if int8_path else None

    bench_fp32 = benchmark_onnx(fp32_path, n_runs=50)
    bench_int8 = benchmark_onnx(int8_path, n_runs=50) if int8_path else None

    # ---- final summary ----
    print("\n" + "=" * 60)
    print("TRAINING SUMMARY — leaf_gate")
    print("=" * 60)
    print(f"Total training time     : {total_train_time:.1f} sec")
    print(f"Best val_acc            : {best_val_acc:.4f}")
    print(f"Best val_loss           : {best_val_loss:.4f}")
    print(f"Calibrated threshold    : {threshold_config['threshold']:.4f}")
    print(f"Ambiguous zone          : {threshold_config['ambiguous_range']}")
    print(f"Precision/recall (leaf) : {threshold_config['precision_leaf_at_threshold']:.4f} / "
          f"{threshold_config['recall_leaf_at_threshold']:.4f}")
    print(f"ONNX fp32 size          : {fp32_size_mb:.2f} MB")
    if int8_size_mb is not None:
        print(f"ONNX int8 size          : {int8_size_mb:.2f} MB")
    if bench_fp32:
        print(f"Avg inference (fp32)    : {bench_fp32[0]:.2f} ms  (std {bench_fp32[1]:.2f} ms, n=50)")
    if bench_int8:
        print(f"Avg inference (int8)    : {bench_int8[0]:.2f} ms  (std {bench_int8[1]:.2f} ms, n=50)")
    print("=" * 60)


if __name__ == "__main__":
    main()


# ==========================================================================
# BAGIAN 6 — Dokumentasi Integrasi (production usage)
# ==========================================================================
#
# Alur penggunaan saat inference production:
# 1. User upload gambar.
# 2. Resize ke 128x128, jalankan leaf_gate model (idealnya model ONNX
#    int8 dari exported/model_int8.onnx untuk latensi terendah) pada
#    gambar ORIGINAL — SEBELUM background removal, karena tujuan gate ini
#    adalah mendeteksi "apakah objek utama foto ini daun", bukan
#    mengevaluasi hasil segmentasi.
# 3. Hitung softmax -> P(leaf) dan P(not_leaf). Baca threshold dan
#    ambiguous_range dari eval/threshold_config.json (jangan hardcode).
# 4. Terapkan keputusan 3-tingkat (lihat fungsi `gate_decision()` di atas
#    untuk reference implementation):
#       - P(leaf) di zona ambigu (mis. 0.4–0.6)
#             -> reject, pesan: "gambar kurang jelas, coba foto ulang
#                dengan pencahayaan lebih baik dan daun sebagai objek utama"
#       - P(leaf) >= threshold (di luar zona ambigu)
#             -> lanjutkan ke background removal + patch splitting +
#                disease classifier (5 model yang sudah ada)
#       - P(leaf) < threshold (di luar zona ambigu)
#             -> reject, pesan error jelas ke user bahwa gambar
#                terdeteksi bukan foto daun.
# 5. Gate ini terpisah total dari 5 model disease classifier — jangan
#    dipanggil dengan preprocessing.py (patch 32x32) yang dipakai untuk
#    pipeline utama; gate selalu bekerja di atas gambar utuh 128x128.
# ==========================================================================
