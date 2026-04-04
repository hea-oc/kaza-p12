'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { getPropertyBySlug } from '@/lib/api';
import Modal from '@/app/components/Modal';
import Collapse from '@/app/components/Collapse';
import { useAuth } from '@/app/context/AuthContext';

interface Property {
  id: string;
  slug: string;
  title: string;
  cover: string;
  pictures?: string[];
  price_per_night: number;
  location: string;
  description: string;
  equipments: string[];
  tags: string[];
  host: {
    id: number;
    name: string;
    picture: string;
  };
  rating_avg: number;
}

export default function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      const data = await getPropertyBySlug(slug);
      setProperty(data);
      setLoading(false);
    };
    fetchProperty();
  }, [slug]);

  // Synchronise le mini-carrousel de droite quand l'index principal change
  useEffect(() => {
    setThumbStart(prev => {
      if (selectedImageIndex < prev) return Math.max(0, selectedImageIndex % 2 === 0 ? selectedImageIndex : selectedImageIndex - 1);
      if (selectedImageIndex >= prev + 4) return selectedImageIndex - 3;
      return prev;
    });
  }, [selectedImageIndex]);

  const handleDeleteProperty = async () => {
    if (!property || !confirm('Supprimer cette annonce ? Cette action est irréversible.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${property.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur serveur');
    } finally {
      setDeleting(false);
    }
  };

  const handleContactHost = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!property) return;

    setStartingConversation(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          recipient_id: property.host.id,
          property_id: property.id
        })
      });

      if (response.ok) {
        router.push('/messages');
      } else {
        alert('Erreur lors du démarrage de la conversation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du démarrage de la conversation');
    } finally {
      setStartingConversation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kasa-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-kasa-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Logement non trouvé</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Utiliser SEULEMENT les pictures (cover est souvent identique à pictures[0])
  const carouselImages = property.pictures && property.pictures.length > 0
    ? property.pictures
    : [property.cover];

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full overflow-hidden">
        {/* Breadcrumb - Retour aux annonces */}
        <div className="mb-8">
          <Link href="/" className="inline-block bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium text-sm">
            &lt; Retour aux annonces
          </Link>
        </div>

        {/* Galerie + Hôte en haut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Colonne gauche: Galerie mosaïque */}
          <div className="lg:col-span-2 min-w-0">
            <div className="flex gap-2 h-72 md:h-80">
              {/* Grande image principale avec carrousel */}
              <div
                className="relative flex-3 rounded-xl overflow-hidden bg-gray-300 cursor-pointer group"
                onClick={() => setIsModalOpen(true)}
              >
                <Image src={carouselImages[selectedImageIndex]} alt={property.title} fill className="object-cover" priority />
                {carouselImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((selectedImageIndex - 1 + carouselImages.length) % carouselImages.length); }}
                      aria-label="Image précédente"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/60 transition text-sm opacity-0 group-hover:opacity-100"
                    >◀</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((selectedImageIndex + 1) % carouselImages.length); }}
                      aria-label="Image suivante"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/60 transition text-sm opacity-0 group-hover:opacity-100"
                    >▶</button>
                    <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition">
                      {selectedImageIndex + 1} / {carouselImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Miniatures droite : max 4 visibles, navigation si > 4 */}
              {carouselImages.length > 1 && (
                <div className="hidden md:flex flex-2 relative group/thumbs">
                  {/* Grille 2×2 — occupe toute la hauteur */}
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
                    {carouselImages.slice(thumbStart, thumbStart + 4).map((img, i) => {
                      const realIndex = thumbStart + i;
                      const isSelected = selectedImageIndex === realIndex;
                      return (
                        <button
                          key={realIndex}
                          onClick={() => setSelectedImageIndex(realIndex)}
                          aria-label={`Voir image ${realIndex + 1}`}
                          className={`relative w-full h-full rounded-lg overflow-hidden bg-gray-200 transition ${isSelected ? 'ring-2 ring-kasa-dark-red' : 'opacity-70 hover:opacity-100'}`}
                        >
                          <Image src={img} alt={`${property.title} ${realIndex + 1}`} fill className="object-cover" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Flèches en overlay absolu — n'affectent pas la hauteur de la grille */}
                  {thumbStart > 0 && (
                    <button
                      onClick={() => setThumbStart(s => Math.max(0, s - 2))}
                      aria-label="Images précédentes"
                      className="absolute top-1 left-1/2 -translate-x-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow opacity-0 group-hover/thumbs:opacity-100 transition z-10"
                    >▲</button>
                  )}
                  {thumbStart + 4 < carouselImages.length && (
                    <button
                      onClick={() => setThumbStart(s => Math.min(carouselImages.length - 4, s + 2))}
                      aria-label="Images suivantes"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow opacity-0 group-hover/thumbs:opacity-100 transition z-10"
                    >▼</button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite: Sidebar hôte */}
          <div className="bg-white rounded-2xl p-6 h-fit">
            <h3 className="text-gray-900 font-bold mb-4">Votre hôte</h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                {property.host.picture ? (
                  <Image
                    src={property.host.picture}
                    alt={property.host.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-kasa-dark-red flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {property.host.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-bold text-gray-900 text-sm">{property.host.name}</p>
              <div className="bg-gray-200 rounded px-2 py-1 w-fit flex items-center gap-1">
                <span className="text-kasa-dark-red text-sm">★</span>
                <span className="text-gray-700 text-sm font-medium">{Math.round(property.rating_avg)}</span>
              </div>
            </div>

            {user && String(user.id) === String(property.host.id) ? (
              <div className="flex flex-col gap-2">
                <div className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg text-sm text-center">
                  Vous êtes propriétaire et responsable de cette annonce
                </div>
                <button
                  onClick={handleDeleteProperty}
                  disabled={deleting}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition text-sm disabled:opacity-50"
                >
                  {deleting ? 'Suppression...' : 'Supprimer cette annonce'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleContactHost}
                  disabled={startingConversation}
                  aria-label={`Contacter l'hôte ${property.host.name}`}
                  className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition text-sm disabled:opacity-50"
                >
                  {startingConversation ? 'Chargement...' : "Contacter l'hôte"}
                </button>
                <button
                  onClick={handleContactHost}
                  disabled={startingConversation}
                  aria-label={`Envoyer un message à ${property.host.name}`}
                  className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition text-sm disabled:opacity-50"
                >
                  {startingConversation ? 'Chargement...' : 'Envoyer un message'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card blanche arrondie: Titre, description, équipements */}
        <div
          className="bg-white rounded-2xl p-8"
          itemScope
          itemType="https://schema.org/LodgingBusiness"
        >
          {/* Titre et localisation */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2" itemProp="name">{property.title}</h1>

          <p className="text-gray-600 text-sm mb-6 flex items-center gap-1" itemProp="address">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.64954C10.7562 1.64958 12.9999 3.89332 13 6.64954C13 10.2208 8.40493 14.108 8.20508 14.2775C8.14527 14.3245 8.07262 14.3507 8 14.3507C7.92737 14.3507 7.85474 14.3248 7.79492 14.2736C7.59834 14.1112 3 10.2179 3 6.64954C3.00015 3.89329 5.24372 1.64954 8 1.64954ZM8 2.29114C5.59842 2.29114 3.64077 4.24372 3.64062 6.64954C3.64062 9.51701 7.11113 12.8078 8 13.6027C8.88896 12.8034 12.3584 9.51268 12.3584 6.64954C12.3583 4.24802 10.4058 2.29118 8 2.29114ZM8 4.44836C9.21363 4.44836 10.2011 5.43591 10.2012 6.64954C10.2012 7.86319 9.21365 8.85071 8 8.85071C6.78636 8.85069 5.79883 7.86318 5.79883 6.64954C5.79887 5.43593 6.78639 4.44839 8 4.44836ZM8 5.08997C7.14108 5.08999 6.44047 5.79062 6.44043 6.64954C6.44043 7.50848 7.14106 8.20908 8 8.20911C8.85896 8.20911 9.55957 7.5085 9.55957 6.64954C9.55953 5.79061 8.85894 5.08997 8 5.08997Z"
                fill="#999"
              />
            </svg>
            {property.location}
          </p>

          {/* Prix (microdata invisible) */}
          <meta itemProp="priceRange" content={`${property.price_per_night}€ par nuit`} />
          <meta itemProp="image" content={property.cover} />

          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed" itemProp="description">{property.description}</p>

          {/* Équipements */}
          {property.equipments && property.equipments.length > 0 && (
            <div className="mb-4">
              <Collapse title="Équipements" defaultOpen>
                <div className="flex flex-wrap gap-2">
                  {property.equipments.map((equipment, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                      {equipment}
                    </span>
                  ))}
                </div>
              </Collapse>
            </div>
          )}

          {/* Catégories / Tags */}
          {property.tags && property.tags.length > 0 && (
            <Collapse title="Catégorie" defaultOpen>
              <div className="flex flex-wrap gap-2">
                {property.tags.map((tag, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </Collapse>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal fullscreen pour image */}
      <Modal
        isOpen={isModalOpen}
        imageUrl={carouselImages[selectedImageIndex]}
        alt={property.title}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
