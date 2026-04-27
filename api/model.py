import json
import io
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf

BASE_DIR = Path(__file__).parent

model = None
class_map = None

IMG_SIZE = (224, 224)

def _load():
    global model
    global class_map
    
    if model is  None:
        model_path = BASE_DIR / "weight"/ "food_classifier.keras"
        model = tf.keras.models.load_model(str(model_path))
        
    if class_map is None:
        class_map_path = BASE_DIR / "weight" / "class_map.json"
        with open(class_map_path, "r") as f:
            class_map = json.load(f)    
            
def predict_food_from_bytes(image_bytes: bytes) -> tuple[str, float]:
    _load()
    
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    image = np.array(image)
    
    array = np.array(image, dtype = np.float32) / 255.0
    array = np.expand_dims(array, axis = 0)
    
    preds = model.predict(array, verbose=0)[0]
    class_index = int(np.argmax(preds))
    confidence = float(preds[class_index])
    
    if str(class_index) in class_map:
        class_name = class_map[str(class_index)]
    
    else:
        reverse = {v: k for k, v in class_map.items()}
        class_name = reverse.get(class_index, f"class_{class_index}")
    
    return class_name, confidence

def get_class_name(class_index: int) -> str:
    _load()
    
    if isinstance(list(class_map.values())[0], str):
        return class_map[str(class_index)]
        
    else:
        reverse = {v: k for k, v in class_map.items()}
        return reverse.get(class_index, f"class_{class_index}")
    

        


    