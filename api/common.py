import csv
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
import keras

BACKBONES = {
    "densenet121":    (keras.applications.DenseNet121,      224, "torch"),
    "efficientnetb0": (keras.applications.EfficientNetB0,   224, "none"),
    "mobilenetv2":    (keras.applications.MobileNetV2,      224, "tf"),
    "inceptionv3":    (keras.applications.InceptionV3,      224, "tf"),
    "resnet50":       (keras.applications.ResNet50,         224, "caffe"),
    "efficientnetb3": (keras.applications.EfficientNetB3,   300, "none"),
    "efficientnetv2s": (keras.applications.EfficientNetV2S, 384, "none"),
}

# ปรับค่าตามโมเดล
@keras.saving.register_keras_serializable(package="gindaimai")
class BackbonePreprocess(keras.layers.Layer):
    def __init__(self, mode="none", **kwargs):
        super().__init__(**kwargs)
        self.mode = mode

    def call(self, image):
        if self.mode == "tf":
            return image / 127.5 - 1.0

        if self.mode == "torch":
            mean = tf.constant([0.485, 0.456, 0.406], dtype=image.dtype)
            std = tf.constant([0.229, 0.224, 0.225], dtype=image.dtype)
            return (image / 255.0 - mean) / std

        if self.mode == "caffe":
            image = tf.reverse(image, axis=[-1])
            mean = tf.constant([103.939, 116.779, 123.68], dtype=image.dtype)
            return image - mean

        return image    # โหมด "none" (EfficientNet)

    def get_config(self):
        config = super().get_config()
        config.update({"mode": self.mode})
        return config

def load_split(data_dir, split = None):
    data_dir = Path(data_dir)

    with open(data_dir / "classes.json", "r", encoding="utf-8") as file:
        classes = json.load(file)

    with open(data_dir / "dataset.csv", "r", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))

    if split is not None:
        rows = [r for r in rows if r["split"] == split]

    paths = [
        str(data_dir / r["cache_path"])
        for r in rows
    ]

    labels = np.array([
        [float(r[name]) for name in classes]
        for r in rows
    ], dtype = np.float32)

    return paths, labels, rows, classes

def decode_image(path, size):
    img = tf.io.read_file(path)
    img = tf.io.decode_jpeg(img, channels=3)
    img = tf.cast(img, tf.float32)
    img = tf.image.resize(img, [size, size])
    return img

def augment_image(img, size):
    big = int(size * 1.15)
    img = tf.image.resize(img, [big, big])
    img = tf.image.random_crop(img, [size, size, 3])
    img = tf.image.random_flip_left_right(img)
    img = tf.image.random_flip_up_down(img)
    img = tf.image.random_brightness(img, 25.0)
    img = tf.image.random_contrast(img, 0.85, 1.15)
    img = tf.image.random_saturation(img, 0.85, 1.15)
    img = tf.image.random_hue(img, 0.02)
    return tf.clip_by_value(img, 0.0, 255.0)

def make_dataset(paths, labels, size, batch, training):
    dataset = tf.data.Dataset.from_tensor_slices((paths, labels))

    if training:
        dataset = dataset.shuffle(len(paths))

    def process_image(path, label):
        image = decode_image(path, size)

        if training:
            image = augment_image(image, size)

        return image, label

    dataset = dataset.map(
        process_image,
        num_parallel_calls=tf.data.AUTOTUNE
    )
    dataset = dataset.batch(batch)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)

    return dataset

# คำนวณ Loss โดยเพิ่มน้ำหนักให้ส่วนผสมที่พบได้น้อย
@keras.saving.register_keras_serializable(package="gindaimai")
class WeightedBCE(keras.losses.Loss):

  def __init__(self, pos_weight=None, **kwargs):
    super().__init__(**kwargs)
    self.pos_weight = pos_weight

  def call(self, y_true, y_pred):
    y_pred = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
    weight = tf.constant(self.pos_weight, dtype=tf.float32)
    loss = -( weight * y_true * tf.math.log(y_pred) + (1 - y_true) * tf.math.log(1 - y_pred) )

    return tf.reduce_mean(loss, axis=-1)

  def get_config(self):
    config = super().get_config()
    config.update({"pos_weight": self.pos_weight})

    return config

# สร้างโมเดลจำแนกส่วนผสมอาหาร
def build_model(backbone, n_classes, size, dropout=0.3, weights="imagenet"):
    constructor, _, mode = BACKBONES[backbone]
    base_model = constructor(
        include_top=False,
        weights=weights,
        input_shape=(size, size, 3),
        pooling="avg"
    )
    base_model.trainable = False
    image = keras.Input(shape=(size, size, 3))
    x = BackbonePreprocess(mode)(image)
    x = base_model(x, training=False)
    x = keras.layers.Dropout(dropout)(x)
    output = keras.layers.Dense(
        n_classes,
        activation="sigmoid"
    )(x)
    model = keras.Model(image, output)

    return model, base_model

# คำนวณน้ำหนักของแต่ละส่วนผสม
def pos_weights(labels):
    positive = labels.sum(axis=0).clip(min=1)
    negative = len(labels) - positive
    weight = np.sqrt(negative / positive)

    return np.clip(weight, 1.0, 10.0)