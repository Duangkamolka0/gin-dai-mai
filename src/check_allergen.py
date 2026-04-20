from ingredient_extraction import get_ingredients   
from allergen_detection import check_allergy

menu_name = "somtam_thai"
user_allergy = ["shellfish", "fish", "peanut"]

ingredients = get_ingredients(menu_name)
found_allergys = check_allergy(ingredients, user_allergy)

result = check_allergy(ingredients, user_allergy)

print("MENU : ", menu_name)
print("FOUND ALLENGEN : ", found_allergys)