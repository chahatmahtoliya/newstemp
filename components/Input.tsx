import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

interface FileInputProps {
  label: string;
  onFileSelect: (base64: string | null) => void;
  selectedFile: string | null;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">
      {label}
    </label>
    <input
      className={`w-full bg-news-gray border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:border-news-red focus:ring-1 focus:ring-news-red transition-colors ${className}`}
      {...props}
    />
  </div>
);

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">
      {label}
    </label>
    <textarea
      className={`w-full bg-news-gray border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:border-news-red focus:ring-1 focus:ring-news-red transition-colors min-h-[100px] ${className}`}
      {...props}
    />
  </div>
);

export const FileInput: React.FC<FileInputProps> = ({ label, onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">
        {label}
      </label>
      
      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-dashed border-gray-600 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-news-red hover:bg-gray-800/50 transition-all group"
        >
          <Upload className="w-8 h-8 text-gray-500 mb-2 group-hover:text-news-red transition-colors" />
          <span className="text-xs text-gray-400 group-hover:text-gray-300">Click to upload background image</span>
        </div>
      ) : (
        <div className="relative w-full border border-gray-700 rounded-md overflow-hidden group">
          <img src={selectedFile} alt="Preview" className="w-full h-32 object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white bg-black/50 px-2 py-1 rounded">Image Selected</span>
              <button 
                onClick={clearFile}
                className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
    </div>
  );
};