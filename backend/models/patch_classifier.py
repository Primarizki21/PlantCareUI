import os
import numpy as np
import onnxruntime as ort
from PIL import Image

class PatchClassifier:
    def __init__(self):
        self.session = None
        self.input_name = None
        self.output_name = None
        # Mean and std for ImageNet normalization
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(3, 1, 1)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(3, 1, 1)
        # Class 0: healthy, Class 1: unhealthy
        self.healthy_class_idx = 0

    def load_model(self):
        if self.session is not None:
            return
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.abspath(os.path.join(
            current_dir, "..", "..", "mobilenetv3_small", "exported", "model.onnx"
        ))
        
        if not os.path.exists(model_path):
            # Fallback to model_int8.onnx if standard model.onnx doesn't exist
            model_path = os.path.abspath(os.path.join(
                current_dir, "..", "..", "mobilenetv3_small", "exported", "model_int8.onnx"
            ))
            
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"ONNX model file not found at {model_path}")
            
        self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name

    def preprocess_patch(self, patch: Image.Image) -> np.ndarray:
        # Resize to 224x224
        patch_resized = patch.resize((224, 224), Image.Resampling.BILINEAR)
        # Convert to numpy array of shape (3, 224, 224) and normalize to [0, 1]
        patch_np = np.array(patch_resized, dtype=np.float32).transpose(2, 0, 1) / 255.0
        # Normalize with ImageNet mean/std
        patch_normalized = (patch_np - self.mean) / self.std
        return patch_normalized

    def classify_patches(self, image: Image.Image) -> list:
        self.load_model()
        
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        width, height = image.size
        patch_w = width / 8
        patch_h = height / 8
        
        patches_list = []
        coordinates = []
        
        # Crop all 64 patches and preprocess them
        patch_idx = 1
        for row in range(8):
            for col in range(8):
                x_min = int(col * patch_w)
                y_min = int(row * patch_h)
                x_max = int((col + 1) * patch_w)
                y_max = int((row + 1) * patch_h)
                
                # Crop
                patch_img = image.crop((x_min, y_min, x_max, y_max))
                # Preprocess
                patch_tensor = self.preprocess_patch(patch_img)
                patches_list.append(patch_tensor)
                
                coordinates.append({
                    "id": patch_idx,
                    "x": col,
                    "y": row
                })
                patch_idx += 1
                
        # Stack into batch (64, 3, 224, 224)
        batch = np.stack(patches_list, axis=0)
        
        # Run inference
        outputs = self.session.run([self.output_name], {self.input_name: batch})[0]
        
        # Apply softmax on outputs
        exp_logits = np.exp(outputs - np.max(outputs, axis=1, keepdims=True))
        probabilities = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)
        
        results = []
        for i, coord in enumerate(coordinates):
            prob_healthy = float(probabilities[i, self.healthy_class_idx])
            prob_unhealthy = float(probabilities[i, 1 - self.healthy_class_idx])
            
            # Predict
            status = "healthy" if prob_healthy > prob_unhealthy else "unhealthy"
            confidence = prob_healthy if status == "healthy" else prob_unhealthy
            
            results.append({
                "id": coord["id"],
                "x": coord["x"],
                "y": coord["y"],
                "status": status,
                "confidence": confidence
            })
            
        return results

classifier = PatchClassifier()
