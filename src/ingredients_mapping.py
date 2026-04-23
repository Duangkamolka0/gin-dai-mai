import json
from collections import defaultdict

with open("dataset/ingredients.json", "r", encoding="utf-8") as f:
    INGREDIENTS_DB = json.load(f)

with open("dataset/thai_ingredients_label.json", "r", encoding="utf-8") as f:
    THAI_LABELS = json.load(f)["ingredient_thai_label"]

def get_ingredients(menu_name, threshold=0.1):

    if menu_name not in INGREDIENTS_DB:
        return []

    variants = INGREDIENTS_DB[menu_name]

    ingredient_count = {}

    for variant in variants:
        prob = variant["prob"]
        ingredients = variant["ingredients"]

        for ing in ingredients:
            if ing not in ingredient_count:
                ingredient_count[ing] = 0
            
            ingredient_count[ing] += prob

    result = []

    for ing in ingredient_count:
        prob = ingredient_count[ing]

        if prob >= threshold:
            result.append(
                {
                "ingredient": ing,
                "thai_name": THAI_LABELS.get(ing, ing),
                "prob": round(prob, 2)
                
            }
            )

    result.sort(key=lambda x: x["prob"], reverse=True)

    return result

# ─── TEST ─────────────────────────────
menus = ["padthai", "somtam"]

for menu in menus:
    print("\nเมนู:", menu)

    items = get_ingredients(menu)

    for item in items:
        print(f"{item['thai_name']} ({item['prob']})")