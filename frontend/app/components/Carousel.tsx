'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Props du composant Carousel.
 *
 * @property images - Tableau ordonné des URLs d'images à afficher.
 * @property alt   - Texte alternatif de base utilisé pour chaque image
 *                   (suffixé par le numéro de l'image, ex : "Appartement - Image 2").
 */
interface CarouselProps {
  images: string[];
  alt: string;
}

/**
 * Carousel d'images interactif pour la page de détail d'un logement.
 *
 * Comportement selon le nombre d'images :
 * - 0 image  → affiche un placeholder "Aucune image disponible"
 * - 1 image  → affiche l'image sans flèches ni compteur (conforme aux specs)
 * - 2+ images → carousel complet avec navigation, compteur et raccourcis clavier
 *
 * Accessibilité :
 * - `role="region"` + `aria-label` identifiant la galerie
 * - `aria-label` explicites sur chaque bouton ("Image précédente / suivante")
 * - `aria-live="polite"` sur le compteur → annoncé par les lecteurs d'écran
 * - Navigation clavier : flèche gauche / droite quand le carousel a le focus
 *
 * @param props - {@link CarouselProps}
 */
export default function Carousel({ images, alt }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cas où il n'y a qu'une seule image
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-300">
        <p className="absolute inset-0 flex items-center justify-center text-gray-500">
          Aucune image disponible
        </p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-300">
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  // Recule à l'image précédente, boucle sur la dernière si on est à l'index 0. 
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Avance à l'image suivante, boucle sur la première si on est à la dernière. 
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Gère la navigation clavier (flèche gauche / droite) quand le carousel a le focus.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <div
      role="region"
      aria-label={`Galerie photos : ${alt}`}
      className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-300 group"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Image principale */}
      <Image
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        fill
        sizes="100vw"
        className="object-cover transition-opacity duration-300"
        priority
      />

      {/* Boutons navigation */}
      <button
        onClick={goToPrevious}
        aria-label="Image précédente"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        aria-label="Image suivante"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicateur de page */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium"
      >
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
