import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lock, Unlock, RotateCcw, Copy, Check, Image } from 'lucide-react';
import { ImageEditor } from './components/ImageEditor';
import { Direction, encrypt, decrypt } from './helpers/encryption';
import { fileToCanvas, extractBinaryFromImage } from './helpers/imageUtils';
import { HelpModal } from './components/HelpModal';

type Mode = 'encrypt' | 'decrypt';

function App() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [encryptInput, setEncryptInput] = useState('');
  const [decryptInput, setDecryptInput] = useState('');
  const [result, setResult] = useState('');
  const [code, setCode] = useState<Direction[]>([]);
  const [copySuccess, setCopySuccess] = useState<'code' | 'result' | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleCopy = async (type: 'code' | 'result') => {
    const textToCopy = type === 'code' 
      ? code.join(', ')
      : result;
    
    await navigator.clipboard.writeText(textToCopy);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const getDirectionIcon = (direction: Direction) => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-4 h-4" />;
      case 'down': return <ArrowDown className="w-4 h-4" />;
      case 'left': return <ArrowLeft className="w-4 h-4" />;
      case 'right': return <ArrowRight className="w-4 h-4" />;
    }
  };

  const handleArrowClick = (direction: Direction) => {
    const newCode = [...code, direction];
    setCode(newCode);
    processMessage(newCode);
  };

  const reset = () => {
    setCode([]);
    setResult('');
  };

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    if (mode !== 'decrypt') return;

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const canvas = await fileToCanvas(file);
      const binaryData = await extractBinaryFromImage(canvas);
      setDecryptInput(binaryData);
    } catch (error) {
      console.error('Failed to extract binary data from image:', error);
    }
  };

  const processMessage = (currentCode: Direction[]) => {
    try {
      if (mode === 'encrypt') {
        const encrypted = encrypt(encryptInput, currentCode);
        setResult(encrypted);
      } else {
        const decrypted = decrypt(decryptInput, currentCode);
        setResult(decrypted);
      }
    } catch {
      setResult('Invalid input or wrong sequence');
    }
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

        {/* Input Areas */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-pink-500/30">
          {/* Encrypt Input */}
          <div className={mode === 'encrypt' ? 'block' : 'hidden'}>
            <textarea
              value={encryptInput}
              onChange={(e) => setEncryptInput(e.target.value)}
              placeholder="Enter message to encrypt..."
              className="w-full h-32 bg-gray-700 text-pink-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-pink-500/50 font-mono whitespace-pre-wrap transition-all duration-150"
            />
          </div>
          
          {/* Decrypt Input */}
          <div className={mode === 'decrypt' ? 'block' : 'hidden'}>
            <textarea
              value={decryptInput}
              onChange={(e) => setDecryptInput(e.target.value)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('ring-2', 'ring-pink-500');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-pink-500');
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-pink-500');
                handleDrop(e);
              }}
              placeholder="Enter binary code to decrypt..."
              className="w-full h-32 bg-gray-700 text-pink-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-pink-500/50 font-mono whitespace-pre-wrap transition-all duration-150"
            />
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-[10px] hover:text-pink-400 block"
            >
              No way I'm doing that by hand
            </button>

          </div>
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
          <div className="flex justify-between items-center mb-2">
            <div>Code Sequence:</div>
            {code.length > 0 && (
              <button
                onClick={() => handleCopy('code')}
                className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                title="Copy code sequence"
              >
                {copySuccess === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {code.map((direction, i) => (
              <div
                key={i}
                className="flex items-center justify-center bg-gray-700 p-2 rounded-md"
                title={`Step ${i + 1}: ${direction}`}
              >
                {getDirectionIcon(direction)}
              </div>
            ))}
          </div>
        </div>

        {/* Result Area */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-pink-500/30">
          <div className="flex justify-between items-center mb-2">
            <div>Result:</div>
            <div className="flex gap-2">
              {result && mode === 'encrypt' && (
                <button
                  onClick={() => setShowImageEditor(true)}
                  className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                  title="Open image editor"
                >
                  <Image className="w-4 h-4" />
                </button>
              )}
              {result && (
                <button
                  onClick={() => handleCopy('result')}
                  className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                  title="Copy result"
                >
                  {copySuccess === 'result' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
          <pre className="font-mono break-all whitespace-pre-wrap">
            {result || 'Result will appear here...'}
          </pre>
        </div>
      </div>
      {showImageEditor && result && (
        <ImageEditor
          binaryData={result}
          onClose={() => setShowImageEditor(false)}
        />
      )}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
}

export default App;
