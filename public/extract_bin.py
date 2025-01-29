from PIL import Image
import os

def extract_binary_from_image(image_path):
    # Load and convert image to grayscale
    img = Image.open(image_path).convert('L')
    
    # Config values matching the pseudo code
    scale = 6
    threshold = 125
    data_bits = 8
    
    # Calculate number of lines based on image height and scale
    num_lines = round(img.height / scale)
    
    # Extract binary data
    lines = []
    for y in range(num_lines):
        line = ''
        for x in range(data_bits):
            # Sample top-left pixel of each block
            pixel = img.getpixel((x * scale, y * scale))
            # Convert to binary based on threshold
            bit = '1' if pixel > threshold else '0'
            line += bit
        lines.append(line)
    
    return '\n'.join(lines)

def main():
    # Example path for Windows user (modify as needed)
    image_path = r"C:\Users\YourUsername\Pictures\yourimage.png"
    
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return
    
    try:
        binary_data = extract_binary_from_image(image_path)
        print("Extracted binary data:")
        print(binary_data)
        
        # Optional: Save to file
        output_path = os.path.join(os.path.dirname(image_path), "binary_output.txt")
        with open(output_path, 'w') as f:
            f.write(binary_data)
        print(f"\nBinary data saved to: {output_path}")
        
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    main()
