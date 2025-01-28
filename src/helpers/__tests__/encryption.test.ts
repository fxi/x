import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, Direction } from '../encryption';

describe('Encryption', () => {
  describe('encrypt and decrypt', () => {
    it('successfully encrypts and decrypts ASCII text', () => {
      const originalText = 'Hello World';
      const shifts: Direction[] = ['up', 'left', 'down', 'right'];
      
      const encrypted = encrypt(originalText, shifts);
      expect(encrypted).not.toBe(originalText);
      expect(encrypted.split('\n').length).toBe(originalText.length * 2); // Two bytes per char
      
      const decrypted = decrypt(encrypted, shifts);
      expect(decrypted).toBe(originalText);
    });

    it('produces different results with different sequences', () => {
      const text = 'Test';
      const sequence1: Direction[] = ['up', 'up'];
      const sequence2: Direction[] = ['up', 'down'];
      
      const result1 = encrypt(text, sequence1);
      const result2 = encrypt(text, sequence2);
      expect(result1).not.toBe(result2);
    });

    it('accumulates complexity with each step', () => {
      const text = 'A';
      const results = new Set();
      const sequence: Direction[] = [];
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      
      // Try each direction and verify it produces a unique result
      directions.forEach(direction => {
        sequence.push(direction);
        const encrypted = encrypt(text, sequence);
        results.add(encrypted);
      });
      
      // Each step should produce a unique result
      expect(results.size).toBe(4);
    });

    it('handles empty string', () => {
      const shifts: Direction[] = ['up', 'down'];
      expect(encrypt('', shifts)).toBe('');
      expect(decrypt('', shifts)).toBe('');
    });

    it('handles UTF-8 characters', () => {
      const originalText = '你好世界';
      const shifts: Direction[] = ['up', 'left', 'down', 'right'];
      
      const encrypted = encrypt(originalText, shifts);
      expect(encrypted).not.toBe(originalText);
      expect(encrypted.split('\n').length).toBe(originalText.length * 2); // Two bytes per char
      
      const decrypted = decrypt(encrypted, shifts);
      expect(decrypted).toBe(originalText);
    });

    it('maintains reversibility with long sequences', () => {
      const text = 'Test Message';
      const shifts: Direction[] = Array(20).fill('').map(() => 
        ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Direction
      );
      
      const encrypted = encrypt(text, shifts);
      const decrypted = decrypt(encrypted, shifts);
      expect(decrypted).toBe(text);
    });
  });
});
