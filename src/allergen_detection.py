import json
# downlode dataset from ingredient_allergen_mapping.json
with open('dataset/ingredients_allergen_mapping.json', 'r') as f:
    data = json.load(f)
    
ingredient_allergen_map = data["ingredient_allergen_map"]

def check_allergy(ingredients, user_allergy) :
    found_allergy = []
    
    for item in ingredients :
        if item in ingredient_allergen_map :
            allergens = ingredient_allergen_map[item]
            
            for allergen in allergens :
                if allergen in user_allergy :
                    found_allergy.append(allergen)
                    
    return list(set(found_allergy))
                