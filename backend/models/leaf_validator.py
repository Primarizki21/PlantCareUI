import os
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

class LeafValidator:
    IMG_SIZE = 128

    def __init__(self):
        self.model = None
        self.transform = transforms.Compose([
            transforms.Resize((self.IMG_SIZE, self.IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        # ImageFolder order: leaf=0, not_leaf=1 (alphabetical)
        self.leaf_class_idx = 0

    def load_model(self):
        if self.model is not None:
            return
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.abspath(os.path.join(current_dir, "..", "..", "best_model.pt"))
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Leaf validation model best_model.pt not found at {model_path}")
            
        self.model = models.mobilenet_v2(num_classes=2)
        state_dict = torch.load(model_path, map_location="cpu")
        self.model.load_state_dict(state_dict)
        self.model.eval()

    def predict(self, image: Image.Image) -> dict:
        self.load_model()
        
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        input_tensor = self.transform(image).unsqueeze(0)
        
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1).numpy()[0]
            
        leaf_prob = float(probabilities[self.leaf_class_idx])
        not_leaf_prob = float(probabilities[1 - self.leaf_class_idx])
        
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
