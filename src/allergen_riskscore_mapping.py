import json
from collections import defaultdict

with open("dataset/ingredients.json", "r", encoding="utf-8") as f:
    INGREDIENTS_DB = json.load(f)
    
with open("dataset/ingredients_allergen_mapping.json", "r", encoding="utf-8") as f:
    ALLERGEN_MAPPING = json.load(f)["ingredient_allergen_map"]
    
with open("dataset/allergen_labels.json", "r", encoding="utf-8") as f:
    ALLERGEN_LABEL = json.load(f)
    
with open("dataset/thai_ingredients_label.json", "r", encoding="utf-8") as f:
    THAI_LABELS = json.load(f)["ingredient_thai_label"]
    
with open("dataset/thai_menu.json", "r", encoding="utf-8") as f:
    THAI_MENU = json.load(f)["menu_thai_labels"]
    
THAI_ALLERGEN = {
    "milk": "นม",
    "egg": "ไข่",
    "fish": "ปลา",
    "shellfish": "อาหารทะเลเปลือกแข็ง",
    "tree_nut": "ถั่วเปลือกแข็ง",
    "peanut": "ถั่วลิสง",
    "wheat": "ข้าวสาลี",
    "soy": "ถั่วเหลือง",
    "sesame": "งา"
    
}

LEVEL_SCORE = {
    "low" : 1,
    "medium" : 2,
    "high" : 3

}

def get_thai(name) :
    return THAI_LABELS.get(name, THAI_ALLERGEN.get(name, name))

def get_ingredients(menu_name):
    
    if menu_name not in INGREDIENTS_DB:
        return []
    
    variants = INGREDIENTS_DB[menu_name]
    
    count = defaultdict(float)
    
    for v in variants:
        for ing in v["ingredients"]:
            count[ing] += v["prob"]
            
    result = []
    
    for ing, prob in count.items():
        result.append({
            "ingredient": ing,
            "thai_name": get_thai(ing),
            "prob": round(prob, 2)
        })
        
    return result

def get_level_color(score, prob):
    if prob == 0:
        return "ไม่พบ", "gray"
    elif score >= 70:
        return "สูง", "red"
    elif score >= 30:
        return "ปานกลาง", "orange"
    else:
        return "ต่ำ", "green"
    
def get_allergen(menu_name, allergen_level, custom_ingredients):
    
    ingredients = get_ingredients(menu_name)
    
    allergen_count = {}
    
    for item in ingredients:
        ing = item["ingredient"]
        prob = item["prob"]

        allergen_list = ALLERGEN_MAPPING.get(ing, [])
        
        for allergen in allergen_list:
            if allergen not in allergen_count:
                allergen_count[allergen] = 0
            
            allergen_count[allergen] += prob
            
            if allergen_count[allergen] > 1:
                allergen_count[allergen] = 1
                
    result = []
    
    for allergen in allergen_count:
        prob = allergen_count[allergen]

        system_score = ALLERGEN_LABEL.get(allergen, {}).get("score", 1)

        user_lv = allergen_level.get(allergen, "low")
        user_score = LEVEL_SCORE[user_lv]

        risk_raw = prob * system_score * user_score
        score = min(100, round(risk_raw * 10))

        level, color = get_level_color(score, prob)

        result.append({
            "name": allergen,
            "thai": get_thai(allergen),
            "score": score,
            "prob": round(prob, 2),
            "level": level,
            "color": color
        })
    
    for allergen, user_lv in allergen_level.items():
       
        if allergen not in allergen_count:  
            
            result.append({
                "name": allergen,
                "thai": get_thai(allergen),
                "prob": 0.0,
                "score": 0,
                "level": "ไม่พบ",
                "color": "gray"
            })
        
        
    for item in ingredients:
        ing = item["ingredient"]
        prob = item["prob"]
        
        if ing in custom_ingredients:
            
            user_lv = custom_ingredients.get(ing, "low")
            user_score = LEVEL_SCORE[user_lv]
            
            score = min(100, round(prob * user_score * 10))
            level, color = get_level_color(score, prob)
            
            result.append({
                "name": ing,
                "thai": get_thai(ing),
                "score": score,
                "prob": round(prob, 2),
                "level": level,
                "color": color
            })

    result.sort(key=lambda x: x["score"], reverse=True)
    return result

def get_overall_score(result):
    
    found = [item for item in result if item.get("prob", 0) > 0 or item["score"] > 0]
    
    if not found:
        return "ความเสี่ยงต่ำ", "green"
    
    max_score = max(item["score"] for item in found)
    if max_score >= 70:
        return "ความเสี่ยงสูง", "red"
    elif max_score >= 30:
        return "ความเสี่ยงปานกลาง", "orange"
    else:
        return "ความเสี่ยงต่ำ", "green"
    
    
if __name__ == "__main__":
    allergen_level = {
        "shellfish": "high",
        "peanut": "medium",
        "milk": "low",
    }
    custom_ingredients = {
        "tofu": "high",
        "coconut_milk": "low"
    }
    menus = ["padkrapao"]

    for menu in menus:
        items = get_allergen(menu, allergen_level, custom_ingredients)
        overall_level, overall_color = get_overall_score(items)
        thai_name = THAI_MENU.get(menu, menu)

        print(f"\n {thai_name} | ความเสี่ยงโดยรวม: {overall_level} color: {overall_color}")
       
        for item in items:
            print(f"  {item['thai']:<25} score: {item['score']:<5} level: {item['level']:<10} color: {item['color']}")