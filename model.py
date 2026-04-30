import json
import io
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf

BASE_DIR = Path(__file__).parent

model_food = None
class_map_index_to_class = None

IMG_SIZE = (224, 224) 

def load_model_and_label():
    global model_food
    global class_map_index_to_class
    
    if model_food is  None:
        model_path = BASE_DIR / "weight"/ "food_classifier.keras"
        model_food = tf.keras.models.load_model(str(model_path))
        
    if class_map_index_to_class is None:
        class_map_path = BASE_DIR / "weight" / "class_map.json"
        with open(class_map_path, "r") as f:
            raw = json.load(f)    
            class_map_index_to_class = {str(v): k for k, v in raw.items()}
            
def predict_food_from_bytes(image_bytes: bytes) -> tuple[str, float]:
    load_model_and_label()
    
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    
    input_tensor = np.array(image, dtype=np.float32) / 255.0
    input_tensor = np.expand_dims(input_tensor, axis=0)
    
    prediction = model_food.predict(input_tensor, verbose=0)[0]
    class_index = int(np.argmax(prediction))
    confidence = float(prediction[class_index])
    
    class_name = class_map_index_to_class.get(str(class_index), f"class_{class_index}")
    
    return class_name, confidence

def get_class_name(class_index: int) -> str:
    load_model_and_label()
    
    if isinstance(list(class_map_index_to_class.values())[0], str):
        return class_map_index_to_class.get(str(class_index), f"class_{class_index}")
        
    else:
        reverse = {v: k for k, v in class_map_index_to_class.items()}
        return reverse.get(class_index, f"class_{class_index}")
