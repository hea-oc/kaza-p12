'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Property {
  id: string;
  slug: string;
  title: string;
  cover: string;
  price_per_night: number;
  location: string;
}

/**
 * Card de propriété affichée dans la grille d'annonces et la page favoris.
 * Gère l'état favori localement (localStorage) et le synchronise avec l'API
 * si l'utilisateur est connecté.
 *
 * @param property - Données de la propriété à afficher
 * @param onUnfavorite - Callback optionnel appelé quand l'utilisateur retire un favori.
 *   Utilisé par la page favoris pour retirer la card immédiatement sans rechargement.
 */

/** Clé localStorage pour les favoris */
const FAVORITES_KEY = 'kasa_favorites';

/** Lit les IDs favoris depuis localStorage */
function getFavoritesFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Sauvegarde les IDs favoris dans localStorage */
function saveFavoritesToStorage(ids: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export default function PropertyCard({ property, onUnfavorite }: { property: Property; onUnfavorite?: (id: string) => void }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Charger l'état favori depuis localStorage au montage
  useEffect(() => {
    const favorites = getFavoritesFromStorage();
    setIsFavorite(favorites.includes(property.id));
  }, [property.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const favorites = getFavoritesFromStorage();
    let updated: string[];

    if (isFavorite) {
      updated = favorites.filter(id => id !== property.id);
    } else {
      updated = [...favorites, property.id];
    }

    saveFavoritesToStorage(updated);
    setIsFavorite(!isFavorite);

    // Notifier la page favoris pour retirer la card immédiatement
    if (isFavorite && onUnfavorite) onUnfavorite(property.id);

    // Sync avec l'API si connecté
    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user'); // vérifier la présence du token et des données utilisateur
    if (token && userRaw) {
      const method = isFavorite ? 'DELETE' : 'POST';
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${property.id}/favorite`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  return (
    <Link href={`/property/${property.slug}`}>
      <div className="rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="relative w-full h-56 bg-gray-200">
          <Image
            src={property.cover}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
          <button
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={isFavorite}
            className="absolute top-3 right-3 bg-white rounded-lg p-2 hover:shadow-md transition-shadow flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill={isFavorite ? '#FF6060' : 'none'}
              stroke={isFavorite ? 'none' : '#000000'}
              strokeWidth="0.5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.2002 6.28595C3.2002 9.97795 8.0002 12.4579 8.0002 12.4579C8.0002 12.4579 12.8002 9.97995 12.8002 6.28595C12.8002 4.77195 11.5722 3.54395 10.0582 3.54395C9.2342 3.54395 8.5042 3.91395 8.0002 4.48995C7.4982 3.91395 6.7662 3.54395 5.9422 3.54395C4.4282 3.54195 3.2002 4.76995 3.2002 6.28595Z" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
              {property.title}
            </h3>
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1.64954C10.7562 1.64958 12.9999 3.89332 13 6.64954C13 10.2208 8.40493 14.108 8.20508 14.2775C8.14527 14.3245 8.07262 14.3507 8 14.3507C7.92737 14.3507 7.85474 14.3248 7.79492 14.2736C7.59834 14.1112 3 10.2179 3 6.64954C3.00015 3.89329 5.24372 1.64954 8 1.64954ZM8 2.29114C5.59842 2.29114 3.64077 4.24372 3.64062 6.64954C3.64062 9.51701 7.11113 12.8078 8 13.6027C8.88896 12.8034 12.3584 9.51268 12.3584 6.64954C12.3583 4.24802 10.4058 2.29118 8 2.29114ZM8 4.44836C9.21363 4.44836 10.2011 5.43591 10.2012 6.64954C10.2012 7.86319 9.21365 8.85071 8 8.85071C6.78636 8.85069 5.79883 7.86318 5.79883 6.64954C5.79887 5.43593 6.78639 4.44839 8 4.44836ZM8 5.08997C7.14108 5.08999 6.44047 5.79062 6.44043 6.64954C6.44043 7.50848 7.14106 8.20908 8 8.20911C8.85896 8.20911 9.55957 7.5085 9.55957 6.64954C9.55953 5.79061 8.85894 5.08997 8 5.08997Z"
                  fill="#999"
                />
              </svg>
              {property.location}
            </p>
          </div>
          <p className="text-kasa-black font-semibold text-sm">
            {property.price_per_night}€ <span className="text-gray-600 font-normal">par nuit</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
