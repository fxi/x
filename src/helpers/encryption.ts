export type Direction = 'up' | 'down' | 'left' | 'right';

// Convert string to array of 16-bit integers (UTF-16 code units)
const stringToBytes = (str: string): number[] => {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Split 16-bit number into two 8-bit numbers
    bytes.push((code >> 8) & 0xFF);  // high byte
    bytes.push(code & 0xFF);         // low byte
  }
  return bytes;
};

// Convert array of bytes back to string
const bytesToString = (bytes: number[]): string => {
  let result = '';
  // Combine pairs of bytes back into 16-bit code units
  for (let i = 0; i < bytes.length; i += 2) {
    const code = (bytes[i] << 8) | bytes[i + 1];
    result += String.fromCharCode(code);
  }
  return result;
};

// Generate a unique pattern based on step number and direction
const getPattern = (step: number, direction: Direction): number => {
  const base = step + 1;  // Avoid step 0
  const prime = {
    'up': 17,
    'down': 23,
    'left': 29,
    'right': 31
  }[direction];
  
  // Use larger primes and more complex mixing
  const mixed = ((base * prime * 0x9e3779b9) >>> 0) % 256;  // Golden ratio hash
  return mixed & 0xFF;  // Ensure 8-bit result
};

// Apply transformation to a byte with accumulating complexity
const transformByte = (byte: number, pattern: number, step: number): number => {
  // Use step to create position-dependent transformation
  const position = step % 8;
  // Rotate left by position bits
  const rotated = ((byte << position) | (byte >> (8 - position))) & 0xFF;
  // XOR with pattern
  const xored = rotated ^ pattern;
  // Additional mixing based on step
  const mixed = ((xored * 7 + step * 11) >>> 0) % 256;
  return mixed & 0xFF;
};

// Reverse the byte transformation
const reverseTransformByte = (byte: number, pattern: number, step: number): number => {
  // Reverse the additional mixing
  let unmixed = byte;
  for (let i = 0; i < 256; i++) {
    if (((i * 7 + step * 11) >>> 0) % 256 === byte) {
      unmixed = i;
      break;
    }
  }
  // Reverse XOR (XOR is its own inverse)
  const unxored = unmixed ^ pattern;
  // Reverse the rotation
  const position = step % 8;
  return ((unxored >> position) | (unxored << (8 - position))) & 0xFF;
};

export const encrypt = (text: string, shifts: Direction[]): string => {
  if (!text) return '';
  
  // Convert text to bytes
  let bytes = stringToBytes(text);
  
  // Apply transformations for each shift
  shifts.forEach((direction, step) => {
    const pattern = getPattern(step, direction);
    bytes = bytes.map(byte => transformByte(byte, pattern, step));
  });
  
  // Convert to binary strings and join with newlines
  return bytes.map(byte => byte.toString(2).padStart(8, '0')).join('\n');
};

export const decrypt = (encoded: string, shifts: Direction[]): string => {
  if (!encoded) return '';
  
  // Convert binary strings back to bytes
  let bytes = encoded.split('\n').map(bin => parseInt(bin, 2));
  
  // Apply reverse transformations in reverse order
  for (let i = shifts.length - 1; i >= 0; i--) {
    const pattern = getPattern(i, shifts[i]);
    bytes = bytes.map(byte => reverseTransformByte(byte, pattern, i));
  }
  
  // Convert bytes back to string
  return bytesToString(bytes);
};
