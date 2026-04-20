import os
import json
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.densenet import preprocess_input

BASE_DIR = os.path.dirname(__file__)
model = tf.keras.models.load_model(os.path.join(BASE_DIR, '..', 'output', 'food_classifier.keras'))

with open(os.path.join(BASE_DIR, '..', 'output', 'class_map.json'), 'r') as f:
    class_map = json.load(f)
    
CLASS_NAMES = list(class_map.keys())

def predict_food(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    
    img_array = image.img_to_array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = model.predict(img_array)[0]
    
    best_index = np.argmax(predictions)
    class_name = CLASS_NAMES[best_index]
    confidence = predictions[best_index]
    
    plt.imshow(img)
    plt.axis('off')
    plt.title(f'{class_name}: {confidence*100:.1f}%')
    plt.show()

    return class_name, confidence
    
    
# TEST
if __name__ == '__main__':
    img_path = 'dataset/thai-food-dataset/padthai/padthai (9).jpg'  
    class_name, confidence = predict_food(img_path)
    print(f'Detected: {class_name} ({confidence*100:.1f}%)')

