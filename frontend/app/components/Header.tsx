import Image from 'next/image';
import Navbar from './Navbar';

/**
 * Section hero de la page d'accueil.
 * Affiche le titre principal et une image d'ambiance.
 * Utilisé uniquement sur la page d'accueil (pas réutilisable comme Navbar).
 */
export default function Header() {
  return (
    <header>
      <div className="bg-kasa-bg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-kasa-dark-red mb-2">
              Chez vous, partout et ailleurs
            </h1>
            <p className="text-gray-600 text-sm">
              Avec Kasa, vivez des séjours uniques dans des hébergements chaleteux,
              sélectionnés avec soin par nos hôtes.
            </p>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-300">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop"
              alt="Chez vous"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  );
}
