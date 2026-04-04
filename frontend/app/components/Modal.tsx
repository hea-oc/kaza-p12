'use client';

import Image from 'next/image';

interface ModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export default function Modal({ isOpen, imageUrl, alt, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl max-h-screen" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          ✕
        </button>
        <Image
          src={imageUrl}
          alt={alt}
          width={1200}
          height={800}
          className="object-contain max-h-screen"
        />
      </div>
    </div>
  );
}
