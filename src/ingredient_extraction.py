import json
# downlode dataset
with open('dataset/ingredients.json', 'r') as f:
    data = json.load(f)

def get_ingredients(menu_name) :
    
    for category in data:
        menu = data[category]
        if menu_name in menu:
            return menu[menu_name]
            
    return "Menu not found"

