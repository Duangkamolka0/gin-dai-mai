import json


def get_level_color(score, prob):
    if prob == 0:
        return "ไม่พบ", "gray"
    elif score >= 70:
        return "สูง", "red"
    elif score >= 30:
        return "ปานกลาง", "orange"
    else:
        return "ต่ำ", "green"


def analyze_allergens(food_name):
    with open("ingredients_allergen_mapping.json", "r", encoding="utf-8") as file:
        data = json.load(file)

    food = data.get(food_name.lower())

    if not food:
        return {
            "overall_risk": "ไม่พบข้อมูล",
            "allergens": []
        }

    allergens_result = []
    highest_score = 0

    for item in food["allergens"]:
        name = item["name"]
        score = item["score"]
        prob = item["probability"]

        level, color = get_level_color(score, prob)

        if score > highest_score:
            highest_score = score

        allergens_result.append({
            "name": name,
            "score": score,
            "probability": prob,
            "level": level,
            "color": color
        })

    overall_level, _ = get_level_color(highest_score, 1)

    return {
        "overall_risk": overall_level,
        "allergens": allergens_result
    }