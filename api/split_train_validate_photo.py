import os
import random
import shutil

original_folder = "dataset/thai-food-dataset-two"
output = "food_dataset_complete_two"

# ลบโฟลเดอร์เก่าทิ้ง
if os.path.exists(output):
    shutil.rmtree(output)

for main_cls in os.listdir(original_folder):

    main_path = os.path.join(original_folder, main_cls)

    if not os.path.isdir(main_path):
        continue

    for cls in os.listdir(main_path):

        path = os.path.join(main_path, cls)

        if not os.path.isdir(path):
            continue

        images = [
            img for img in os.listdir(path)
            if img.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        ]

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
            shutil.copy(
                os.path.join(path, img),
                os.path.join(dst, img)
            )

        # val
        for img in val_images:
            dst = os.path.join(output, "val", cls)
            os.makedirs(dst, exist_ok=True)
            shutil.copy(
                os.path.join(path, img),
                os.path.join(dst, img)
            )

        # test
        for img in test_images:
            dst = os.path.join(output, "test", cls)
            os.makedirs(dst, exist_ok=True)
            shutil.copy(
                os.path.join(path, img),
                os.path.join(dst, img)
            )

        print(
            f"{cls}: "
            f"train={len(train_images)}, "
            f"val={len(val_images)}, "
            f"test={len(test_images)}"
        )

print("Complete")