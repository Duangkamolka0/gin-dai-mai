from .allergen_riskscore_mapping import get_allergen, get_overall_score, get_menu_thai, get_thai


def analyze_allergens(food_name: str, allergen_level: dict = None, custom_ingredients: dict = None,
                      detected: list = None) -> dict:
    """detected = ส่วนผสมที่โมเดลส่วนผสมเห็นในรูป [{"ingredient": "shrimp", "prob": 0.9}, ...]"""
    allergen_level = allergen_level or {}
    custom_ingredients = custom_ingredients or {}

    items = get_allergen(food_name, allergen_level, custom_ingredients, detected)
    overall_level, overall_color = get_overall_score(items)

    allergens = []
    for item in items:
        allergens.append({
            "name": item["thai"],
            "score": item["score"],
            "level": item["level"],
            "color": item["color"],
            "certainty": item.get("certainty"),     # "confirmed" | "possible" | None
        })

    return {
        "food_name_thai": get_menu_thai(food_name),
        "overall_risk": {"level": overall_level, "color": overall_color},
        "allergens": allergens,
        "detected_ingredients": [
            {"ingredient": d["ingredient"], "thai": get_thai(d["ingredient"]), "prob": d["prob"]}
            for d in (detected or [])
        ],
    }