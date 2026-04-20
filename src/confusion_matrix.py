import os
import numpy as np
import tensorflow as tf
import json
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.efficientnet import preprocess_input
from keras.models import load_model

model = tf.keras.models.load_model('output/food_classifier.keras')

with open('output/class_map.json') as f:
    class_map = json.load(f)

class_names = list(class_map.keys())

test_data = ImageDataGenerator(preprocessing_function = preprocess_input)

test_loader = test_data.flow_from_directory (
    'food_dataset_complete/test',
    target_size = (224, 224),
    batch_size = 32,
    class_mode = 'categorical',
    shuffle = False
)

y_pred = model.predict(test_loader)
y_pred = np.argmax(y_pred, axis = 1)

y_true = test_loader.classes


cm = confusion_matrix(y_true, y_pred)
print("Confusion Matrix:")
print(cm)

print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names = class_names))

plt.figure(figsize=(8,6))
sns.heatmap(cm, annot=True, fmt='d',
            xticklabels=class_names,
            yticklabels=class_names
)

plt.xlabel('Predicted')
plt.ylabel('True')
plt.title('Confusion Matrix')
plt.savefig('confusion_matrix.png')

with open('classification_report.txt', 'w') as f:
    f.write(classification_report(y_true, y_pred))

plt.show()