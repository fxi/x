import { IMAGE_CONFIG } from '../config/imageConfig';

export const validateBinaryString = (binary: string): string => {
  if (!binary) return '';
  // Replace invalid chars with 0 and ensure 8-bit length
  return binary.replace(/[^01]/g, '0').padEnd(8, '0').slice(0, 8);
};

export const createBinaryImage = (binaryData: string): HTMLCanvasElement => {
  if (!binaryData) return document.createElement('canvas');

  const lines = binaryData.split('\n').map(validateBinaryString);
  const canvas = document.createElement('canvas');
  canvas.width = 100 * IMAGE_CONFIG.scale;
  canvas.height = lines.length * IMAGE_CONFIG.scale;
  const ctx = canvas.getContext('2d')!;

  // Fill background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw binary data
  ctx.fillStyle = IMAGE_CONFIG.color;
  lines.forEach((line, y) => {
    for (let x = 0; x < 8; x++) {
      if (line[x] === '1') {
        ctx.fillRect(
          x * IMAGE_CONFIG.scale,
          y * IMAGE_CONFIG.scale,
          IMAGE_CONFIG.scale,
          IMAGE_CONFIG.scale
        );
      }
    }
  });

  return canvas;
};

export const extractBinaryFromImage = async (canvas: HTMLCanvasElement): Promise<string> => {
  if (canvas.height === 0) return '';

  const ctx = canvas.getContext('2d')!;
  const scale = IMAGE_CONFIG.scale;
  const numLines = Math.floor(canvas.height / scale);
  const lines: string[] = [];

  for (let y = 0; y < numLines; y++) {
    let line = '';
    for (let x = 0; x < 8; x++) {
      const pixel = ctx.getImageData(
        x * scale,
        y * scale,
        1,
        1
      ).data;
      line += pixel[0] > IMAGE_CONFIG.threshold ? '1' : '0';
    }
    lines.push(validateBinaryString(line));
  }

  return lines.join('\n');
};

export const fileToCanvas = async (file: File): Promise<HTMLCanvasElement> => {
  const img = new window.Image();
  img.src = URL.createObjectURL(file);
  await new Promise<void>(resolve => {
    img.onload = () => resolve();
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);
  return canvas;
};
