import json
import io
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf

BASE_DIR = Path(__file__).parent

WEIGHT_PATH = BASE_DIR/"weight"/"food_classifier_efficientnetb0.keras"
CLASS_MAP_PATH = BASE_DIR/"weight"/"class_map.json"

IMG_SIZE = (224, 224) 
THRESHOLD = 0.8
FORCE_FAMILY = {"panang"}
MERGE = {
    "pad thai chicken": "pad thai (chicken/pork)",
    "pad thai pork": "pad thai (chicken/pork)",
}

FAMILY = {

    "som tum poo plara": "som tum",
    "som tum thai": "som tum",

    "pad thai chicken": "pad thai",
    "pad thai goong": "pad thai",
    "pad thai pork": "pad thai",
    "pad thai (chicken/pork)": "pad thai",

    "tom yum kung nam kon": "tom yum",
    "tom yum kung nam sai": "tom yum",
    "tom yum pla": "tom yum",
    "tom yum seafood": "tom yum",

    "beef green curry": "green curry",
    "chicken green curry": "green curry",

    "pad kra pao beef": "pad kra pao",
    "pad kra pao crispy pork": "pad kra pao",
    "pad kra pao mince pork": "pad kra pao",

    "tomkhagai": "tom kha",

    "larbbeef": "larb",
    "larbchicken": "larb",
    "larbpork": "larb",

    "panangbeef": "panang",
    "panangchicken": "panang",
    "panangpork": "panang",

    "gaeng_som_cha_om_kung": "gaeng som",
    "gaengsomfish": "gaeng som",
    "gaengsomkung": "gaeng som",

    "massamancurrybeef": "massaman",
    "massamancurrychicken": "massaman"
}

model = tf.keras.models.load_model(WEIGHT_PATH, compile = False)

with open(CLASS_MAP_PATH, "r", encoding="utf-8") as file :
    class_map = json.load(file)
    
CLASS_NAMES = [
    name 
    for name, index in sorted(
        class_map.items(),
        key = lambda item: item[1]
    ) 
]

class_map_index_to_class = {
    str(index): name
    for name, index in class_map.items()
}

for class_name in CLASS_NAMES:
    if class_name not in FAMILY:
        raise ValueError(f"ไม่พบเมนู'{class_name}")
    
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes).convert("RGB"))
    
    image = image.resize(IMG_SIZE, Image.NEAREST)
    
    image_array = np.array(image, dtype=np.float32)
    
    image_array = np.expand_dims(image_array, axis=0)
    
    return image_array

def merge_predictions(predictions):
    merge_scores = {}
    
    for i, class_name in enumerate(CLASS_NAMES):
        new_name = MERGE.get(class_name, class_name)
        
        if new_name not in merge_scores:
            merge_scores[new_name] = 0.0
            
        merge_scores[new_name] += predictions[i]

    return merge_scores

def calculate_family_score(class_scores):
    family_scores = {}
    
    for class_name, score in class_scores.items():
        family_name = FAMILY[class_name]
        
        if family_name not in family_scores:
            family_scores[family_name] = 0.0
            
        family_scores[family_name] += score
        
    return family_scores

def find_best_sub_class(class_scores, family_name):
    family_classes = [
        class_name
        for class_name in class_scores
        if FAMILY[class_name] == family_name
    ]
    
    best_class = max(family_classes, key=lambda name: class_scores[name])
    
    best_score = class_scores[best_class]
    
    return best_class, best_score

def predict_food_from_bytes(image_bytes):
    image_array = preprocess_image[(image_bytes)]
    
    predictions = model.predict(image_array, verbose=0)[0]
    
    class_scores = merge_predictions(predictions)
    
    family_scores = calculate_family_score(class_scores)
    
    best_family = max(family_scores, key=family_scores.get)
    
    family_confidence = family_scores[best_family]
    
    best_class, best_score = find_best_sub_class(class_scores, best_family)
    
    subclass_share = (best_score/family_confidence)
    
    if best_family in FORCE_FAMILY:

        result_name = best_family
        result_level = "family"
        result_confidence = family_confidence

    elif subclass_share >= THRESHOLD:

        result_name = best_class
        result_level = "subclass"
        result_confidence = best_score

    else:

        result_name = best_family
        result_level = "family"
        result_confidence = family_confidence

    return {
        "name": result_name,
        "level": result_level,
        "confidence": float(result_confidence),

        "family": best_family,
        "family_confidence": float(
            family_confidence
        ),

        "top_subclass": best_class,
        "subclass_share": float(
            subclass_share
        )
    }
    
def get_class_name(class_index):
    
    if 0 <= class_index < len(CLASS_NAMES):
        return CLASS_NAMES(class_index)
    
    return f"class_{class_index}"
    

    