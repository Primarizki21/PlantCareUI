import os
import numpy as np
import onnxruntime as ort
from PIL import Image


class BackgroundRemover:
    INPUT_SIZE = 320

    def __init__(self):
        self.session = None
        self.input_name = None
        self.output_name = None
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        self.std = np.array([1.0, 1.0, 1.0], dtype=np.float32)

    def load_model(self):
        if self.session is not None:
            return

        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "weights", "u2netp.onnx")

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Background removal model not found at {model_path}"
            )

        self.session = ort.InferenceSession(
            model_path, providers=["CPUExecutionProvider"]
        )
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name

    def remove(self, image: Image.Image) -> Image.Image:
        self.load_model()

        if image.mode != "RGB":
            image = image.convert("RGB")

        original_size = image.size
        resized = image.resize(
            (self.INPUT_SIZE, self.INPUT_SIZE), Image.Resampling.BILINEAR
        )

        arr = np.array(resized, dtype=np.float32) / 255.0
        arr = (arr - self.mean) / self.std
        arr = arr.transpose(2, 0, 1)[None, ...].astype(np.float32)

        pred = self.session.run([self.output_name], {self.input_name: arr})[0]
        mask = pred[0, 0]
        mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)
        mask_uint8 = (mask * 255).astype(np.uint8)

        mask_img = Image.fromarray(mask_uint8, mode="L").resize(
            original_size, Image.Resampling.BILINEAR
        )

        rgba = image.convert("RGBA")
        rgba.putalpha(mask_img)
        return rgba


remover = BackgroundRemover()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        from PIL import ImageDraw

        img = Image.new("RGB", (320, 320), (40, 120, 200))
        draw = ImageDraw.Draw(img)
        draw.ellipse((40, 40, 280, 280), fill=(40, 200, 80))
        img.save("/tmp/_bg_test_leaf.jpg", "JPEG")
        path = "/tmp/_bg_test_leaf.jpg"
    else:
        path = sys.argv[1]

    remover.load_model()
    out = remover.remove(Image.open(path).convert("RGB"))
    assert out.mode == "RGBA", f"expected RGBA, got {out.mode}"
    alpha = out.split()[3]
    extrema = alpha.getextrema()
    assert extrema[1] > 0, "alpha is fully transparent — model output looks broken"
    print(f"OK: {path} -> RGBA{out.size}, alpha range {extrema[0]}..{extrema[1]}")
    out.save("/tmp/_bg_test_out.png")
    print("saved /tmp/_bg_test_out.png")
