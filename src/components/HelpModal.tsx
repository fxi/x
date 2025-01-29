import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const helpContent = `
  Write a program that extracts binary data from a PNG image using the following rules:
- The image contains data encoded in 6x6 pixel blocks
- Only the first 8 columns contain meaningful data
- Each block represents one bit (white = 1, black = 0)
- Sample the top-left pixel of each block
- Use brightness threshold of 125 to determine black/white
- Output should be lines of 8-bit binary strings
- Print result to console
`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-pink-500/30 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-pink-500">Extract Binary Data</h2>
          <button
            onClick={onClose}
            className="text-pink-500 hover:text-pink-400 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <pre className="text-xs text-pink-500/70 whitespace-pre-wrap font-mono">
          {helpContent}
        </pre>
      </div>
    </div>
  );
}
