import json
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
import keras

try:
    from . import common  # โหลด BackbonePreprocess ให้ keras รู้จัก
except ImportError:
    import common

# ส่วนผสมที่โมเดลมองเห็นได้ → กลุ่มสารก่อภูมิแพ้ (ตรงกับคีย์ใน allergen score ของ scorer)
DEFAULT_INGREDIENT_TO_ALLERGEN = {
    "shrimp": "crustacean",
    "salted_crab": "crustacean",
    "squid": "mollusc",
    "mussel": "mollusc",
    "fish": "fish",
    "egg": "egg",
    "peanut": "peanut",
}

def normalize_name(name):
    """'Pad Thai Goong', 'pad_thai_goong', 'padthaigoong' -> 'padthaigoong'"""
    return re.sub(r"[\s_\-]+", "", str(name)).lower()


class IngredientPredictor:
    def __init__(self, run_dir, dish_aliases=None):
        """dish_aliases: optional {dish-model name: name used in fusion.json} for names that differ."""
        run_dir = Path(run_dir)

        self.classes = json.load(
            open(run_dir / "classes.json", encoding="utf-8")
        )

        config = json.load(
            open(run_dir / "config.json", encoding="utf-8")
        )

        self.image_size = config["img_size"]

        # สร้างโครงสร้างโมเดลด้วยโค้ด แล้วโหลดน้ำหนัก (ไม่ขึ้นกับเวอร์ชัน Keras)
        self.model, _ = common.build_model(
            config["backbone"],
            len(self.classes),
            self.image_size,
            weights=None
        )
        self.model.load_weights(run_dir / "model.weights.h5")

        def load_thresholds(file_name):
            file_path = run_dir / file_name

            if not file_path.exists():
                return None

            thresholds = json.load(
                open(file_path, encoding="utf-8")
            )

            return np.array(
                [thresholds.get(name, 0.5) for name in self.classes],
                dtype=np.float32
            )

        self.fused_thresholds = load_thresholds("thresholds_fused.json")
        self.image_thresholds = load_thresholds("thresholds.json")

        if self.image_thresholds is None:
            self.image_thresholds = np.full(
                len(self.classes),
                0.5,
                dtype=np.float32
            )

        self.fusion = False
        self.image_weight = 1.0
        self.prior = {}
        self.prior_names = {}
        self.ingredient_to_allergen = DEFAULT_INGREDIENT_TO_ALLERGEN

        fusion_file = run_dir / "fusion.json"

        if fusion_file.exists() and self.fused_thresholds is not None:
            fusion_data = json.load(
                open(fusion_file, encoding="utf-8")
            )

            self.image_weight = float(
                fusion_data["weight_image"]
            )

            for dish_name, values in fusion_data["prior"].items():
                key = normalize_name(dish_name)

                self.prior[key] = np.array(
                    [values.get(name, 0.0) for name in self.classes],
                    dtype=np.float32
                )

                self.prior_names[key] = dish_name

            self.fusion = True

            self.ingredient_to_allergen = fusion_data.get(
                "ingredient_to_allergen",
                DEFAULT_INGREDIENT_TO_ALLERGEN
            )

        self.aliases = {}

        for name, alias in (dish_aliases or {}).items():
            self.aliases[normalize_name(name)] = normalize_name(alias)

    def prepare_image(self, image):
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")
        image.thumbnail((640, 640), Image.LANCZOS)
        image = image.resize(
            (self.image_size, self.image_size),
            Image.BILINEAR
        )

        return np.asarray(
            image,
            dtype=np.float32
        )[None]

    def find_prior(self, dish):
        if not self.fusion or dish is None:
            return None, None

        dish_key = normalize_name(dish)

        if dish_key in self.aliases:
            dish_key = self.aliases[dish_key]

        if dish_key in self.prior:
            return (
                self.prior[dish_key],
                self.prior_names[dish_key]
            )

        return None, None

    def predict(self, image, dish=None):
        image_input = self.prepare_image(image)

        image_probability = self.model.predict(
            image_input,
            verbose=0
        )[0].astype(np.float32)

        prior_probability, dish_used = self.find_prior(dish)

        if prior_probability is not None:
            probability = (
                self.image_weight * image_probability
                + (1 - self.image_weight) * prior_probability
            )
            thresholds = self.fused_thresholds
        else:
            probability = image_probability
            thresholds = self.image_thresholds

        detected = []

        for index, (name, probability_value, threshold) in enumerate(zip(
            self.classes,
            probability,
            thresholds
        )):
            if probability_value >= threshold:
                detected.append({
                    "ingredient": name,
                    "prob": round(float(probability_value), 4),
                    "allergen": self.ingredient_to_allergen.get(name),
                    "in_image": bool(image_probability[index] >= self.image_thresholds[index])
                })

        detected.sort(
            key=lambda item: -item["prob"]
        )

        allergens = {}

        for item in detected:
            allergen = item["allergen"]

            if allergen:
                allergens[allergen] = max(
                    allergens.get(allergen, 0.0),
                    item["prob"]
                )

        all_predictions = {
            name: round(float(probability_value), 4)
            for name, probability_value in zip(
                self.classes,
                probability
            )
        }

        return {
            "dish_used": dish_used,
            "fusion": prior_probability is not None,
            "detected": detected,
            "allergens": allergens,
            "all": all_predictions
        }


if __name__ == "__main__":
    # python ingredient_predictor.py weights/ingredient image.jpg ["pad thai goong"]
    import sys

    predictor = IngredientPredictor(sys.argv[1])

    result = predictor.predict(
        Image.open(sys.argv[2]),
        dish=sys.argv[3] if len(sys.argv) > 3 else None
    )

    print(
        json.dumps(
            {
                "dish_used": result["dish_used"],
                "fusion": result["fusion"],
                "detected": result["detected"],
                "allergens": result["allergens"]
            },
            ensure_ascii=False,
            indent=2
        )
    )