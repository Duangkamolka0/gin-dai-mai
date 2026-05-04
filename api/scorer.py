from allergen_riskscore_mapping import get_allergen, get_overall_score, THAI_MENU

def analyze_allergens(food_name: str, allergen_level: dict = {}, custom_ingredients: dict = {}) -> dict:
    
    items = get_allergen(food_name, allergen_level, custom_ingredients)
    overall_level, overall_color = get_overall_score(items)
    
    allergens = []
    for item in items:
        allergens.append({
            "name":  item["thai"],
            "score": item["score"],
            "level": item["level"],
            "color": item["color"],
        })
    
    return {
        "food_name_thai": THAI_MENU.get(food_name, food_name),
        "overall_risk": {"level": overall_level, "color": overall_color},
        "allergens": allergens
    
    }