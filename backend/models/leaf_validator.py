import os
import numpy as np
import onnxruntime as ort
from PIL import Image

class LeafValidator:
    IMG_SIZE = 128
    MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    INPUT_NAME = "input"

    def __init__(self):
        self.session = None
        self.leaf_class_idx = 0

    def load_model(self):
        if self.session is not None:
            return

        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "weights", "leaf_validator.onnx")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Leaf validation model not found at {model_path}")

        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])

    def _preprocess(self, image: Image.Image) -> np.ndarray:
        if image.mode != "RGB":
            image = image.convert("RGB")
        resized = image.resize((self.IMG_SIZE, self.IMG_SIZE), Image.BILINEAR)
        arr = np.asarray(resized, dtype=np.float32) / 255.0
        arr = (arr - self.MEAN) / self.STD
        arr = arr.transpose(2, 0, 1)
        return arr[np.newaxis, ...]

    def predict(self, image: Image.Image) -> dict:
        self.load_model()

        x = self._preprocess(image)
        logits = self.session.run(None, {self.INPUT_NAME: x})[0][0]
        shifted = logits - logits.max()
        probs = np.exp(shifted) / np.exp(shifted).sum()

        leaf_prob = float(probs[self.leaf_class_idx])
        not_leaf_prob = float(probs[1 - self.leaf_class_idx])

        is_leaf = leaf_prob > not_leaf_prob
        confidence = leaf_prob if is_leaf else not_leaf_prob

        return {
            "is_leaf": is_leaf,
            "confidence": confidence,
            "message": (
                "The uploaded image appears to contain a plant leaf."
                if is_leaf
                else "The uploaded image is not a valid leaf image."
            )
        }

validator = LeafValidator()
