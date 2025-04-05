from cairosvg import svg2png
import os

def generate_icons():
    # Ensure icons directory exists
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    # Read the SVG file
    with open('icons/icon.svg', 'rb') as f:
        svg_content = f.read()
    
    # Generate PNG files for different sizes
    sizes = [48, 96]
    for size in sizes:
        output_file = f'icons/icon{size}.png'
        svg2png(bytestring=svg_content,
                write_to=output_file,
                output_width=size,
                output_height=size)
        print(f'Generated {output_file}')

if __name__ == '__main__':
    generate_icons() 