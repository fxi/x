import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lock, Unlock, RotateCcw } from 'lucide-react';

type Mode = 'encrypt' | 'decrypt';

function App() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [code, setCode] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleArrowClick = (direction: string) => {
    if (code.length >= 8 && !isComplete) {
      setIsComplete(true);
      processMessage();
      return;
    }
    
    if (!isComplete) {
      setCode([...code, direction]);
    }
  };

  const reset = () => {
    setCode([]);
    setIsComplete(false);
    setResult('');
  };

  const processMessage = () => {
    if (mode === 'encrypt') {
      // Convert to binary and apply shifts based on code
      const binary = stringToBinary(input);
      const shifted = applyShifts(binary, code);
      setResult(shifted);
    } else {
      // Apply reverse shifts and convert from binary
      const shifted = applyShifts(input, code.reverse());
      try {
        const text = binaryToString(shifted);
        setResult(text);
      } catch {
        setResult('Invalid binary code or wrong sequence');
      }
    }
  };

  const stringToBinary = (str: string): string => {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  };

  const binaryToString = (binary: string): string => {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map(byte => 
      String.fromCharCode(parseInt(byte, 2))
    ).join('');
  };

  const applyShifts = (binary: string, shifts: string[]): string => {
    let result = binary;
    shifts.forEach(shift => {
      const mid = Math.floor(result.length / 2);
      switch(shift) {
        case 'up':
          result = result.slice(mid) + result.slice(0, mid);
          break;
        case 'down':
          result = result.slice(-mid) + result.slice(0, -mid);
          break;
        case 'left':
          result = result.slice(1) + result.slice(0, 1);
          break;
        case 'right':
          result = result.slice(-1) + result.slice(0, -1);
          break;
      }
    });
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-pink-500 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 p-4 bg-gray-800 rounded-lg shadow-lg border border-pink-500/30">
          <button
            onClick={() => {reset(); setMode('encrypt');}}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              mode === 'encrypt' 
                ? 'bg-pink-500 text-gray-900' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Lock size={18} /> Encrypt
          </button>
          <button
            onClick={() => {reset(); setMode('decrypt');}}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              mode === 'decrypt' 
                ? 'bg-pink-500 text-gray-900' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Unlock size={18} /> Decrypt
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-pink-500/30">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encrypt' ? 'Enter message to encrypt...' : 'Enter binary code to decrypt...'}
            className="w-full h-32 bg-gray-700 text-pink-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-pink-500/50"
          />
        </div>

        {/* Control Pad */}
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          <div></div>
          <button
            onClick={() => handleArrowClick('up')}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-pink-500/30 active:bg-pink-500 active:text-gray-900 transition-all duration-150"
          >
            <ArrowUp className="w-6 h-6 mx-auto" />
          </button>
          <div></div>
          <button
            onClick={() => handleArrowClick('left')}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-pink-500/30 active:bg-pink-500 active:text-gray-900 transition-all duration-150"
          >
            <ArrowLeft className="w-6 h-6 mx-auto" />
          </button>
          <button
            onClick={() => reset()}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-pink-500/30 active:bg-pink-500 active:text-gray-900 transition-all duration-150"
          >
            <RotateCcw className="w-6 h-6 mx-auto" />
          </button>
          <button
            onClick={() => handleArrowClick('right')}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-pink-500/30 active:bg-pink-500 active:text-gray-900 transition-all duration-150"
          >
            <ArrowRight className="w-6 h-6 mx-auto" />
          </button>
          <div></div>
          <button
            onClick={() => handleArrowClick('down')}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-pink-500/30 active:bg-pink-500 active:text-gray-900 transition-all duration-150"
          >
            <ArrowDown className="w-6 h-6 mx-auto" />
          </button>
          <div></div>
        </div>

        {/* Code Display */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-pink-500/30">
          <div className="text-center mb-2">Code Sequence ({code.length}/8):</div>
          <div className="flex justify-center gap-2">
            {Array(8).fill(null).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  code[i] 
                    ? 'bg-pink-500 shadow-lg shadow-pink-500/50' 
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Result Area */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-pink-500/30">
          <div className="font-mono break-all">
            {result || 'Result will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;