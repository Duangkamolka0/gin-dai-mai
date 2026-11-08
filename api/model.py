import json
import io
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf

from .ingredient_predictor import IngredientPredictor

BASE_DIR = Path(__file__).parent

WEIGHT_PATH = BASE_DIR / "weight" / "food_classifier_efficientnetb0.keras"
CLASS_MAP_PATH = BASE_DIR / "weight" / "class_map.json"
INGREDIENT_DIR = BASE_DIR / "weight" / "ingredient"

IMG_SIZE = (224, 224)
THRESHOLD = 0.8
FORCE_FAMILY = {"panang"}
MERGE = {
    "pad thai chicken": "pad thai (chicken/pork)",
    "pad thai pork": "pad thai (chicken/pork)",
}

# ใช้กับโมเดลเมนูแบบ 26 เมนูย่อย — โมเดล 10 เมนูหลัก (class_map.json ตอนนี้) ไม่ต้องใช้
# เมนูที่ไม่อยู่ในตารางนี้ จะถือว่าเป็นเมนูหลักของตัวเอง
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
    "massamancurrychicken": "massaman",
}

# ชื่อเมนูหลักแบบ 26 คลาส → ชื่อที่ใช้ใน fusion.json ของโมเดลส่วนผสม (ชื่อแบบโมเดล 10 เมนู)
DISH_ALIASES = {
    "tom kha": "tomkhagai",
    "som tum": "somtam",
    "panang": "panangchickencurry",
    "gaeng som": "thaisourcurry",
    "massaman": "massamancurry",
}


def family_of(class_name):
    return FAMILY.get(class_name, class_name)


# ---------- โหลดโมเดล (ครั้งเดียวตอนเปิด server) ----------
model = tf.keras.models.load_model(WEIGHT_PATH, compile=False)

with open(CLASS_MAP_PATH, "r", encoding="utf-8") as file:
    class_map = json.load(file)

CLASS_NAMES = [
    name
    for name, index in sorted(class_map.items(), key=lambda item: item[1])
]

ingredient_model = IngredientPredictor(INGREDIENT_DIR, dish_aliases=DISH_ALIASES)


# ---------- โมเดลเมนู ----------
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMG_SIZE, Image.NEAREST)          # ตรงกับ flow_from_directory ตอนเทรน
    image_array = np.array(image, dtype=np.float32)
    return np.expand_dims(image_array, axis=0)


def merge_predictions(predictions):
    merge_scores = {}
    for i, class_name in enumerate(CLASS_NAMES):
        new_name = MERGE.get(class_name, class_name)
        merge_scores[new_name] = merge_scores.get(new_name, 0.0) + float(predictions[i])
    return merge_scores


def calculate_family_score(class_scores):
    family_scores = {}
    for class_name, score in class_scores.items():
        family_name = family_of(class_name)
        family_scores[family_name] = family_scores.get(family_name, 0.0) + score
    return family_scores


def find_best_sub_class(class_scores, family_name):
    family_classes = [name for name in class_scores if family_of(name) == family_name]
    best_class = max(family_classes, key=lambda name: class_scores[name])
    return best_class, class_scores[best_class]


def predict_food_from_bytes(image_bytes):
    image_array = preprocess_image(image_bytes)
    predictions = model.predict(image_array, verbose=0)[0]

    class_scores = merge_predictions(predictions)
    family_scores = calculate_family_score(class_scores)

    best_family = max(family_scores, key=family_scores.get)
    family_confidence = family_scores[best_family]
    best_class, best_score = find_best_sub_class(class_scores, best_family)
    subclass_share = best_score / family_confidence

    if best_family in FORCE_FAMILY:
        result_name, result_level, result_confidence = best_family, "family", family_confidence
    elif subclass_share >= THRESHOLD:
        result_name, result_level, result_confidence = best_class, "subclass", best_score
    else:
        result_name, result_level, result_confidence = best_family, "family", family_confidence

    return {
        "name": result_name,
        "level": result_level,
        "confidence": float(result_confidence),
        "family": best_family,
        "family_confidence": float(family_confidence),
        "top_subclass": best_class,
        "subclass_share": float(subclass_share),
    }


# ---------- โมเดลส่วนผสม ----------
def predict_ingredients_from_bytes(image_bytes, dish):
    """dish = ชื่อเมนูหลักจากโมเดลเมนู ใช้เปิดสูตรเฉลี่ยใน fusion.json"""
    image = Image.open(io.BytesIO(image_bytes))
    return ingredient_model.predict(image, dish=dish)


def get_class_name(class_index):
    if 0 <= class_index < len(CLASS_NAMES):
        return CLASS_NAMES[class_index]
    return f"class_{class_index}"