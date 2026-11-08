import json
from collections import defaultdict
import os

BASE_DIR = os.path.dirname(__file__)

with open(os.path.join(BASE_DIR, "dataset/ingredients.json"), "r", encoding="utf-8") as f:
    INGREDIENTS_DB = json.load(f)
    
with open(os.path.join(BASE_DIR, "dataset/ingredients_allergen_mapping.json"), "r", encoding="utf-8") as f:
    ALLERGEN_MAPPING = json.load(f)["ingredient_allergen_map"]
    
with open(os.path.join(BASE_DIR, "dataset/allergen_labels.json"), "r", encoding="utf-8") as f:
    ALLERGEN_LABEL = json.load(f)
    
with open(os.path.join(BASE_DIR, "dataset/thai_ingredients_label.json"), "r", encoding="utf-8") as f:
    THAI_LABELS = json.load(f)["thai_ingredients_label"]
    
with open(os.path.join(BASE_DIR, "dataset/thai_menu.json"), "r", encoding="utf-8") as f:
    THAI_MENU = json.load(f)["menu_thai_labels"]
    
THAI_ALLERGEN = {
    "milk": "นม",
    "egg": "ไข่",
    "fish": "ปลา",
    "crustacean": "กุ้ง/ปู",
    "mollusc": "หมึก/หอย",
    "tree_nut": "ถั่วเปลือกแข็ง",
    "peanut": "ถั่วลิสง",
    "wheat": "ข้าวสาลี",
    "soy": "ถั่วเหลือง",
    "sesame": "งา"
}

LEVEL_SCORE = {
    "low": 1,
    "medium": 2,
    "high": 3
}

def get_thai(name):
    return THAI_LABELS.get(name, THAI_ALLERGEN.get(name, name))

def get_allergen_thai(name):
    return THAI_ALLERGEN.get(name, get_thai(name))

MENU_MAPPING = {
    "som tum": {"family": "somtam", "variants": None, "thai_key": "somtam"},
    "som tum poo plara": {"family": "somtam", "variants": ["somtam_pu_pla_ra"], "thai_key": "somtam_pu_pla_ra"},
    "som tum thai": {"family": "somtam", "variants": ["somtam_thai"], "thai_key": "somtam_thai"},
 
    "pad thai": {"family": "pad_thai", "variants": None, "thai_key": "pad_thai"},
    "pad thai goong": {"family": "pad_thai", "variants": ["pad_thai_fresh_shrimp"], "thai_key": "pad_thai_fresh_shrimp"},
    "pad thai (chicken/pork)": {"family": "pad_thai", "variants": ["pad_thai_chicken", "pad_thai_pork"], "thai_key": "pad_thai_chicken_pork"},
    "pad thai chicken": {"family": "pad_thai", "variants": ["pad_thai_chicken"], "thai_key": "pad_thai_chicken"},
    "pad thai pork": {"family": "pad_thai", "variants": ["pad_thai_pork"], "thai_key": "pad_thai_pork"},
 
    "tom yum": {"family": "tom_yum", "variants": None, "thai_key": "tom_yum"},
    "tom yum kung nam kon": {"family": "tom_yum", "variants": ["tom_yum_kung_creamy"], "thai_key": "tom_yum_kung_creamy"},
    "tom yum kung nam sai": {"family": "tom_yum", "variants": ["tom_yum_kung_clear"], "thai_key": "tom_yum_kung_clear"},
    "tom yum pla": {"family": "tom_yum", "variants": ["tom_yum_fish"], "thai_key": "tom_yum_fish"},
    "tom yum seafood": {"family": "tom_yum", "variants": ["tom_yum_talay"], "thai_key": "tom_yum_talay"},
 
    "green curry": {"family": "green_curry", "variants": None, "thai_key": "green_curry"},
    "beef green curry": {"family": "green_curry", "variants": ["green_curry_beef"], "thai_key": "green_curry_beef"},
    "chicken green curry": {"family": "green_curry", "variants": ["green_curry_chicken"], "thai_key": "green_curry_chicken"},
 
    "pad kra pao": {"family": "pad_krapow", "variants": None, "thai_key": "pad_krapow"},
    "pad kra pao beef": {"family": "pad_krapow", "variants": ["pad_krapow_beef"], "thai_key": "pad_krapow_beef"},
    "pad kra pao crispy pork": {"family": "pad_krapow", "variants": ["pad_krapow_crispy_pork"], "thai_key": "pad_krapow_crispy_pork"},
    "pad kra pao mince pork": {"family": "pad_krapow", "variants": ["pad_krapow_minced_pork"], "thai_key": "pad_krapow_minced_pork"},
 
    "tom kha": {"family": "tom_kha", "variants": None, "thai_key": "tom_kha"},
    "tomkhagai": {"family": "tom_kha", "variants": ["tom_kha_gai"], "thai_key": "tom_kha_gai"},
 
    "larb": {"family": "larb", "variants": None, "thai_key": "larb"},
    "larbbeef": {"family": "larb", "variants": ["larb_beef"], "thai_key": "larb_beef"},
    "larbchicken": {"family": "larb", "variants": ["larb_chicken"], "thai_key": "larb_chicken"},
    "larbpork": {"family": "larb", "variants": ["larb_pork"], "thai_key": "larb_pork"},
 
    # หนึ่งสูตร 
    "panang": {"family": "panang_curry", "variants": None, "thai_key": "panang_curry"},
    "panangbeef": {"family": "panang_curry", "variants": None, "thai_key": "panang_curry_beef"},
    "panangchicken": {"family": "panang_curry", "variants": None, "thai_key": "panang_curry_chicken"},
    "panangpork": {"family": "panang_curry", "variants": None, "thai_key": "panang_curry_pork"},
 
    "gaeng som": {"family": "gaeng_som", "variants": None, "thai_key": "gaeng_som"},
    "gaeng_som_cha_om_kung": {"family": "gaeng_som", "variants": ["gaeng_som_cha_om_kung"], "thai_key": "gaeng_som_cha_om_kung"},
    "gaengsomfish": {"family": "gaeng_som", "variants": ["gaeng_som_fish"], "thai_key": "gaeng_som_fish"},
    "gaengsomkung": {"family": "gaeng_som", "variants": ["gaeng_som_kung"], "thai_key": "gaeng_som_kung"},
 
    "massaman": {"family": "massaman_curry", "variants": None, "thai_key": "massaman_curry"},
    "massamancurrybeef": {"family": "massaman_curry", "variants": ["massaman_beef"], "thai_key": "massaman_beef"},
    "massamancurrychicken": {"family": "massaman_curry", "variants": ["massaman_chicken"], "thai_key": "massaman_chicken"},
}

# ชื่อจากโมเดลเมนูแบบ 10 คลาส (class_map.json) → ชื่อเมนูหลักใน MENU_MAPPING
MODEL10_TO_MENU = {
    "padthai": "pad thai",
    "greencurry": "green curry",
    "padkrapao": "pad kra pao",
    "tomyum": "tom yum",
    "somtam": "som tum",
    "massamancurry": "massaman",
    "panangchickencurry": "panang",
    "thaisourcurry": "gaeng som",
    "tomkhagai": "tomkhagai",
    "larb": "larb",
}

USE_INGREDIENT_FREQUENCY = True
 
def get_menu_thai(menu_name):
    menu_name = MODEL10_TO_MENU.get(menu_name, menu_name)
    info = MENU_MAPPING.get(menu_name)
    key = info["thai_key"] if info else menu_name
    return THAI_MENU.get(key, menu_name)
 
 
def get_ingredients(menu_name):
    menu_name = MODEL10_TO_MENU.get(menu_name, menu_name)
    info = MENU_MAPPING.get(menu_name)
 
    if info is not None:
        family_key = info["family"]
        variant_names = info["variants"]
        
    elif menu_name in INGREDIENTS_DB:          
        family_key = menu_name
        variant_names = None
    else:
        return []
 
    variants = INGREDIENTS_DB.get(family_key, [])
    if variant_names is not None:
        variants = [v for v in variants if v["source_menu"] in variant_names]
 
    # ปรับ prob ของ subclass ที่เลือกให้รวมกันได้ 1
    total = sum(v["prob"] for v in variants)
    if total == 0:
        return []
 
    count = defaultdict(float)
    for v in variants:
        weight = v["prob"] / total
        for ing, freq in v["ingredients"].items():
            count[ing] += weight * (freq if USE_INGREDIENT_FREQUENCY else 1.0)
 
    result = []
    for ing, prob in count.items():
        result.append({
            "ingredient": ing,
            "thai_name": get_thai(ing),
            "prob": round(min(prob, 1.0), 2)
        })
 
    return result
 
def combine_ingredients(ingredients, detected):
    """รวมส่วนผสมจากสูตรเมนู (อาจมี) กับส่วนผสมที่โมเดลเห็นในรูป (พบแน่นอน)
    คืน {ingredient: {"prob": ..., "seen": True ถ้าเห็นในรูป}}"""
    combined = {}
    for item in ingredients:
        combined[item["ingredient"]] = {"prob": item["prob"], "seen": False}

    for item in detected or []:
        ing = item["ingredient"]
        prob = float(item["prob"])
        seen = bool(item.get("in_image", True))      # True เฉพาะที่โมเดลภาพเห็นจริง
        if ing in combined:
            combined[ing]["prob"] = max(combined[ing]["prob"], prob)
            combined[ing]["seen"] = combined[ing]["seen"] or seen
        else:
            combined[ing] = {"prob": prob, "seen": seen}

    return combined


def get_level_color(score, prob):
    if prob == 0:
        return "ไม่พบ", "gray"
    elif score >= 70:
        return "สูง", "red"
    elif score >= 30:
        return "ปานกลาง", "orange"
    else:
        return "ต่ำ", "green"
    
def get_allergen(menu_name, allergen_level, custom_ingredients, detected=None):
    combined = combine_ingredients(get_ingredients(menu_name), detected)
    
    ENG_FROM_THAI = {v: k for k, v in THAI_LABELS.items()}
    normalized_custom = {}
    for key, lv in custom_ingredients.items():
        eng_key = ENG_FROM_THAI.get(key, key)
        normalized_custom[eng_key] = lv
    custom_ingredients = normalized_custom
    
    allergen_count = {}
    allergen_seen = set()      # สารก่อภูมิแพ้ที่มาจากส่วนผสมที่เห็นในรูป

    for ing, info in combined.items():
        prob = info["prob"]
        allergen_list = ALLERGEN_MAPPING.get(ing, [])

        for allergen in allergen_list:
            if allergen not in allergen_count:
                allergen_count[allergen] = 0
            allergen_count[allergen] += prob
            if allergen_count[allergen] > 1:
                allergen_count[allergen] = 1
            if info["seen"]:
                allergen_seen.add(allergen)
                
    result = []
    
    for allergen in allergen_count:
        if allergen not in allergen_level:  # ✅ ข้ามถ้า user ไม่ได้เลือก
            continue
        prob = allergen_count[allergen]
        system_score = ALLERGEN_LABEL.get(allergen, {}).get("score", 1)
        user_lv = allergen_level.get(allergen, "low")
        user_score = LEVEL_SCORE[user_lv]
        risk_raw = prob * system_score * user_score
        score = min(100, round(risk_raw * 10))
        level, color = get_level_color(score, prob)
 
        result.append({
            "name": allergen,
            "thai": get_allergen_thai(allergen),
            "score": score,
            "prob": round(prob, 2),
            "level": level,
            "color": color,
            "certainty": "confirmed" if allergen in allergen_seen else "possible"
        })
    
    for allergen, user_lv in allergen_level.items():
        if allergen not in allergen_count:
            result.append({
                "name": allergen,
                "thai": get_allergen_thai(allergen),
                "prob": 0.0,
                "score": 0,
                "level": "ไม่พบ",
                "color": "gray",
                "certainty": None
            })
    
    matched_custom = set()
 
    level_map = {
    "high":   ("สูง",      "red"),
    "medium": ("ปานกลาง", "orange"),
    "low":    ("ต่ำ",      "green")
}
    for ing, info in combined.items():
        prob = info["prob"]
        
        if ing in custom_ingredients:
            matched_custom.add(ing)
            user_lv = custom_ingredients.get(ing, "low")
            user_score = LEVEL_SCORE[user_lv]
            score = min(100, round(prob * user_score * user_score * 10))
            level, color = level_map[user_lv]
            
            result.append({
                "name": ing,
                "thai": get_thai(ing),
                "score": score,
                "prob": round(prob, 2),
                "level": level,
                "color": color,
                "certainty": "confirmed" if info["seen"] else "possible"
            })
 
    for ing in custom_ingredients:
        if ing not in matched_custom:
            result.append({
                "name": ing,
                "thai": get_thai(ing),
                "prob": 0.0,
                "score": 0,
                "level": "ไม่พบ",
                "color": "gray",
                "certainty": None
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
        "crustacean": "high",
        "peanut": "medium",
        "milk": "low",
    }
    custom_ingredients = {
        "tofu": "high",
        "coconut_milk": "low",
        "orange": "medium",
        "chicken": "high"
    }
    menus = ["pad thai goong", "pad thai (chicken/pork)", "pad thai", "padthai", "panang", "larbpork"]
    detected = [{"ingredient": "shrimp", "prob": 0.9}, {"ingredient": "peanut", "prob": 0.85}]   # ตัวอย่างผลจากโมเดลส่วนผสม
 
    for menu in menus:
        items = get_allergen(menu, allergen_level, custom_ingredients, detected)
        overall_level, overall_color = get_overall_score(items)
        thai_name = get_menu_thai(menu)
 
        print(f"\n {thai_name} | ความเสี่ยงโดยรวม: {overall_level} color: {overall_color}")
       
        for item in items:
            print(f"  {item['thai']:<25} score: {item['score']:<5} level: {item['level']:<10} "
                  f"{str(item.get('certainty')):<10} color: {item['color']}")

    # เช็กว่าส่วนผสมที่โมเดลส่วนผสมทายได้ มีในตาราง ingredient → allergen ครบไหม
    MODEL_ALLERGEN_INGREDIENTS = ["shrimp", "salted_crab", "squid", "mussel", "fish", "egg", "peanut"]
    missing = [i for i in MODEL_ALLERGEN_INGREDIENTS if i not in ALLERGEN_MAPPING]
    print("\nส่วนผสมจากโมเดลที่ไม่มีใน ingredients_allergen_mapping.json:", missing or "ไม่มี ✓")