import { describe, it, expect, beforeEach } from 'vitest';
import { createBinaryImage, extractBinaryFromImage } from '../imageUtils';

describe('Image Utils', () => {
  let drawnPixels: boolean[][] = [];

  beforeEach(() => {
    drawnPixels = [];
    // @ts-expect-error - Mocking document for tests
    global.document = {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({
          fillStyle: '',
          fillRect: (x: number, y: number) => {
            const row = Math.floor(y / 10);
            const col = Math.floor(x / 10);
            if (!drawnPixels[row]) drawnPixels[row] = [];
            drawnPixels[row][col] = true;
          },
          getImageData: (x: number, y: number) => {
            const row = Math.floor(y / 10);
            const col = Math.floor(x / 10);
            const isActive = drawnPixels[row]?.[col] ?? false;
            return {
              data: new Uint8Array(isActive ? [255, 255, 255, 255] : [0, 0, 0, 255])
            };
          }
        })
      })
    };
  });

  it('preserves binary data through image conversion', async () => {
    const input = '10101010\n11001100';
    const canvas = createBinaryImage(input);
    const output = await extractBinaryFromImage(canvas);
    expect(output).toBe(input);
  });

  it('handles empty input', async () => {
    const canvas = createBinaryImage('');
    const output = await extractBinaryFromImage(canvas);
    expect(output).toBe('');
  });

  it('validates and normalizes binary data', async () => {
    const input = '1x1\n110';  // Invalid chars and short lines
    const canvas = createBinaryImage(input);
    const output = await extractBinaryFromImage(canvas);
    
    // Should have valid 8-bit lines
    output.split('\n').forEach(line => {
      expect(line).toMatch(/^[01]{8}$/);
    });
  });
});
