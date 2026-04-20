import os
import random
import shutil

original_folder = "dataset/thai-food-dataset"
output = "food_dataset_complete"

for cls in os.listdir(original_folder):
    path = os.path.join(original_folder, cls)

    if not os.path.isdir(path):
        continue

    images = os.listdir(path)
    random.shuffle(images)

    split = int(0.8 * len(images))

    train_image = images[:split]
    val_image = images[split:]

    for img in train_image:
        dst = os.path.join(output, "train", cls)
        os.makedirs(dst, exist_ok=True)
        shutil.copy(os.path.join(path, img), dst)

    for img in val_image:
        dst = os.path.join(output, "val", cls)
        os.makedirs(dst, exist_ok=True)
        shutil.copy(os.path.join(path, img), dst)

print("Complete")


