import os
import random
import shutil

original_folder = "dataset/thai-food-dataset"
output = "food_dataset_complete"

# ลบโฟลเดอร์เก่าทิ้ง
if os.path.exists(output):
    shutil.rmtree(output)

for cls in os.listdir(original_folder):
    path = os.path.join(original_folder, cls)

    if not os.path.isdir(path):
        continue

    images = os.listdir(path)
    random.shuffle(images)

    total = len(images)
    train_split = int(0.8 * total)
    val_split = int(0.9 * total)

    train_images = images[:train_split]
    val_images = images[train_split:val_split]
    test_images = images[val_split:]

    # train
    for img in train_images:
        dst = os.path.join(output, "train", cls)
        os.makedirs(dst, exist_ok=True)
        shutil.copy(os.path.join(path, img), dst)

    # val
    for img in val_images:
        dst = os.path.join(output, "val", cls)
        os.makedirs(dst, exist_ok=True)
        shutil.copy(os.path.join(path, img), dst)

    # test
    for img in test_images:
        dst = os.path.join(output, "test", cls)
        os.makedirs(dst, exist_ok=True)
        shutil.copy(os.path.join(path, img), dst)

print("Complete")