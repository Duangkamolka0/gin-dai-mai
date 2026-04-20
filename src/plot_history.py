import matplotlib.pyplot as plt
import json
import os

def plot_history(history):
    acc     = history['train_acc']
    val     = history['val_acc']
    loss    = history['train_loss']
    val_loss= history['val_loss']

    # Accuracy
    plt.figure()
    plt.plot(acc, label='Train Acc')
    plt.plot(val, label='Val Acc')
    plt.title('Accuracy')
    plt.xlabel('Epoch')
    plt.legend()
    plt.grid(True)
    plt.savefig('result_accuracy.png')
    plt.show()

    # Loss
    plt.figure()
    plt.plot(loss,  label='Train Loss')
    plt.plot(val_loss, label='Val Loss')
    plt.title('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    plt.grid(True)
    plt.savefig('result_loss.png')
    plt.show()

    print('Best Val Accuracy:', max(val))


BASE_DIR = os.path.dirname(__file__)
file_path = os.path.join(BASE_DIR, '..', 'output', 'save_training_result.json')

with open(file_path, 'r') as f:
    history = json.load(f)

plot_history(history)