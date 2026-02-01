import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon, GripVertical, Plus } from 'lucide-react';

interface MultiImageInputProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
}

export const MultiImageInput: React.FC<MultiImageInputProps> = ({
    images,
    onImagesChange,
    maxImages = 10
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            processFiles(Array.from(files));
        }
    };

    const processFiles = (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        const remainingSlots = maxImages - images.length;
        const filesToProcess = imageFiles.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImagesChange([...images, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files) as File[];
        processFiles(files);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
    };

    const handleDragOverItem = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;

        const newImages = [...images];
        const draggedImage = newImages[dragIndex];
        newImages.splice(dragIndex, 1);
        newImages.splice(index, 0, draggedImage);
        onImagesChange(newImages);
        setDragIndex(index);
    };

    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                Images ({images.length}/{maxImages})
            </label>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOverItem(e, index)}
                            className={`relative group aspect-square rounded-md overflow-hidden border-2 cursor-move ${dragIndex === index ? 'border-news-red opacity-50' : 'border-gray-700'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Order badge */}
                            <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                {index + 1}
                            </div>
                            {/* Drag handle */}
                            <div className="absolute top-1 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4 text-white drop-shadow" />
                            </div>
                            {/* Delete button */}
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Zone */}
            {images.length < maxImages && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-all group ${isDragOver
                        ? 'border-news-red bg-news-red/10'
                        : 'border-gray-600 hover:border-news-red hover:bg-gray-800/50'
                        }`}
                >
                    <div className="flex items-center space-x-2 mb-2">
                        <Plus className={`w-5 h-5 transition-colors ${isDragOver ? 'text-news-red' : 'text-gray-500 group-hover:text-news-red'}`} />
                        <ImageIcon className={`w-5 h-5 transition-colors ${isDragOver ? 'text-news-red' : 'text-gray-500 group-hover:text-news-red'}`} />
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 text-center">
                        {images.length === 0 ? 'Click or drag images here' : 'Add more images'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                        {maxImages - images.length} slots remaining
                    </span>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                multiple
                className="hidden"
            />

            {/* Reorder hint */}
            {images.length > 1 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Drag images to reorder
                </p>
            )}
        </div>
    );
};

export default MultiImageInput;
