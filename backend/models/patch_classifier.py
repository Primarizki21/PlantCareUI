import os
import numpy as np
import onnxruntime as ort
from PIL import Image


class PatchClassifier:
    PATCH_SIZE = 128
    GRID_SIZE = 8
    INPUT_SIZE = 256  # must match training input size

    def __init__(self):
        self.session = None
        self.input_name = None
        self.output_name = None
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(3, 1, 1)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(3, 1, 1)
        self.healthy_class_idx = 0

    def load_model(self):
        if self.session is not None:
            return

        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.abspath(os.path.join(
            current_dir, "..", "..", "mobilenetv3_small", "exported", "model.onnx"
        ))

        if not os.path.exists(model_path):
            model_path = os.path.abspath(os.path.join(
                current_dir, "..", "..", "mobilenetv3_small", "exported", "model_int8.onnx"
            ))

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"ONNX model file not found at {model_path}")

        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name

    def classify_patches(self, image: Image.Image) -> tuple[list, int, int]:
        """Return (patch_results, analyzed_count, skipped_count).

        Mirrors the training pipeline: resize whole image to 256x256, split into
        8x8 grid (32x32 cells), drop only patches that are fully transparent,
        upsample the rest to 128x128 and run a single batched inference.
        """
        self.load_model()

        if image.mode != "RGBA":
            image = image.convert("RGBA")

        image = image.resize(
            (self.INPUT_SIZE, self.INPUT_SIZE), Image.Resampling.BILINEAR
        )

        rgba = np.array(image)            # (256, 256, 4)
        alpha = rgba[:, :, 3]
        rgb = rgba[:, :, :3]

        cell = self.INPUT_SIZE // self.GRID_SIZE  # 32
        kept_tensors, kept_coords = [], []
        skipped = 0

        for row in range(self.GRID_SIZE):
            for col in range(self.GRID_SIZE):
                y0, y1 = row * cell, (row + 1) * cell
                x0, x1 = col * cell, (col + 1) * cell
                patch_alpha = alpha[y0:y1, x0:x1]

                if (patch_alpha > 128).mean() < 0.05:
                    skipped += 1
                    continue

                patch_pil = Image.fromarray(rgb[y0:y1, x0:x1])
                patch_resized = patch_pil.resize(
                    (self.PATCH_SIZE, self.PATCH_SIZE), Image.Resampling.BILINEAR
                )
                arr = np.array(patch_resized, dtype=np.float32).transpose(2, 0, 1) / 255.0
                kept_tensors.append((arr - self.mean) / self.std)
                kept_coords.append({"id": row * self.GRID_SIZE + col + 1, "x": col, "y": row})

        if not kept_tensors:
            return [], 0, skipped

        batch = np.stack(kept_tensors, axis=0)
        outputs = self.session.run([self.output_name], {self.input_name: batch})[0]

        exp_logits = np.exp(outputs - np.max(outputs, axis=1, keepdims=True))
        probabilities = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)

        results = []
        for i, coord in enumerate(kept_coords):
            prob_healthy = float(probabilities[i, self.healthy_class_idx])
            prob_unhealthy = float(probabilities[i, 1 - self.healthy_class_idx])
            status = "healthy" if prob_healthy > prob_unhealthy else "unhealthy"
            confidence = prob_healthy if status == "healthy" else prob_unhealthy
            results.append({
                "id": coord["id"],
                "x": coord["x"],
                "y": coord["y"],
                "status": status,
                "confidence": confidence,
            })

        return results, len(kept_tensors), skipped


classifier = PatchClassifier()
