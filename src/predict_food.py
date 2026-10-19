import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image


BASE_DIR = os.path.dirname(__file__)
WEIGHT_DIR = os.path.join(BASE_DIR, '..', 'api', 'weight')
OUTPUT_DIR = os.path.join(BASE_DIR, '..', 'output')


WEIGHT_PATH = os.path.join(
    WEIGHT_DIR,'food_classifier_efficientnetb0.keras'
)

CLASS_MAP_PATH = os.path.join(
    WEIGHT_DIR,'class_map.json'
)

IMG_SIZE = 224
THRESHOLD = 0.8

FORCE_FAMILY = {"panang"}
MERGE = {
    "pad thai chicken": "pad thai (chicken/pork)",
    "pad thai pork": "pad thai (chicken/pork)",
}


#load model

model = tf.keras.models.load_model(
    WEIGHT_PATH,compile=False
)

#load class

with open(CLASS_MAP_PATH, 'r', encoding='utf-8') as f:
    class_map = json.load(f)

CLASS_NAMES = [
    name
    for name, index in sorted(
        class_map.items(),
        key=lambda x: x[1]
    )
]

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

def preprocess(image_path):

    img = image.load_img(
        image_path,
        target_size = (IMG_SIZE, IMG_SIZE)
    )

    image_array = image.img_to_array(img)

    image_array = np.expand_dims(
        image_array,
        axis = 0
    )

    return img, image_array

def predict_food(image_path):

    img, image_array = preprocess(image_path)

    predictions = model.predict(
        image_array,
        verbose = 0
    )[0]

#Merge class 

    names = []

    for class_name in CLASS_NAMES:

        new_name = MERGE.get(
            class_name,
            class_name
        )

        if new_name not in names:
            names.append(new_name)


    merged_probs = np.zeros(len(names))

    for i, class_name in enumerate(CLASS_NAMES):

        new_name = MERGE.get(class_name,class_name)

        index = names.index(new_name)

        merged_probs[index] += predictions[i]


#รวม score

    family_scores = {}

    for i in range(len(names)):

        class_name = names[i]
        family_name = FAMILY[class_name]

        if family_name not in family_scores:
            family_scores[family_name] = 0

        family_scores[family_name] += merged_probs[i]


    best_family = max(
        family_scores,
        key = family_scores.get
    )

    family_confidence = family_scores[best_family]


# หา subclass score สูงสุด

    best_class = None
    best_score = 0

    for i in range(len(names)):

        class_name = names[i]

        if FAMILY[class_name] == best_family:

            if merged_probs[i] > best_score:
                best_score = merged_probs[i]
                best_class = class_name


    subclass_share = (
        best_score / family_confidence
    )

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
        "family_confidence": float(family_confidence),
        "top_subclass": best_class,
        "subclass_share": float(subclass_share)
    }


# =========================
# Test
# =========================

if __name__ == "__main__":
    
    import matplotlib.pyplot as plt

    image_path = "api/food_dataset_complete_two/test/larbpork/larbpork(12).jpg"

    img, _ = preprocess(image_path)

    result = predict_food(image_path)


    print(
        f"Detected: {result['name']} "
        f"({result['confidence'] * 100:.1f}%)"
    )

    print(
        f"Level: {result['level']}"
    )

    print(
        f"Family: {result['family']} "
        f"({result['family_confidence'] * 100:.1f}%)"
    )

    print(
        f"Subclass: {result['top_subclass']} "
        f"({result['subclass_share'] * 100:.1f}%)"
    )

    plt.imshow(img)
    plt.axis("off")

    plt.title(
        f"{result['name']} "
        f"({result['confidence'] * 100:.1f}%)"
    )

    plt.show()