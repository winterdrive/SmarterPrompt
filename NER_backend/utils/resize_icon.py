# resize png for 16, 32, 64, 128, 256, 512, 1024
from PIL import Image
# pip install pillow

def resize_icon(icon_path):
    icon = Image.open(icon_path)
    sizes = [16, 32, 48, 64, 128, 256,320, 512, 1024]
    for size in sizes:
        resized_icon = icon.resize((size, size))
        resized_icon.save(f'icon{size}.png')

if __name__ == '__main__':
    resize_icon(r'./icon1024.png')