'use client';

import { useState } from 'react';

interface CollapseProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Section accordéon avec animation fluide.
 * Un clic sur le titre ouvre ou ferme le contenu.
 * Utilisé sur la page logement pour les équipements et catégories.
 *
 * @param title - Texte affiché dans l'en-tête cliquable
 * @param children - Contenu affiché/masqué
 * @param defaultOpen - Si true, le panneau est ouvert au montage (défaut: false)
 */
export default function Collapse({ title, children, defaultOpen = false }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <path
            d="M3 5.5L8 10.5L13 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-4 bg-white border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
