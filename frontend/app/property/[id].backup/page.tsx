'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { getPropertyById } from '@/lib/api';

interface Property {
  id: string;
  title: string;
  cover: string;
  price_per_night: number;
  location: string;
  description: string;
  equipments: string[];
  categories: string[];
  host: {
    id: number;
    name: string;
    picture: string;
  };
  rating_avg: number;
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      const data = await getPropertyById(id);
      setProperty(data);
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Link href="/" className="text-kasa-dark-red hover:text-kasa-red font-medium text-sm mb-6 inline-block">
          &lt; Retour aux annonces
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-300">
              <Image
                src={property.cover}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative h-20 rounded-lg overflow-hidden bg-gray-300">
                <Image
                  src={property.cover}
                  alt={`${property.title} ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>

            <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1.64954C10.7562 1.64958 12.9999 3.89332 13 6.64954C13 10.2208 8.40493 14.108 8.20508 14.2775C8.14527 14.3245 8.07262 14.3507 8 14.3507C7.92737 14.3507 7.85474 14.3248 7.79492 14.2736C7.59834 14.1112 3 10.2179 3 6.64954C3.00015 3.89329 5.24372 1.64954 8 1.64954ZM8 2.29114C5.59842 2.29114 3.64077 4.24372 3.64062 6.64954C3.64062 9.51701 7.11113 12.8078 8 13.6027C8.88896 12.8034 12.3584 9.51268 12.3584 6.64954C12.3583 4.24802 10.4058 2.29118 8 2.29114ZM8 4.44836C9.21363 4.44836 10.2011 5.43591 10.2012 6.64954C10.2012 7.86319 9.21365 8.85071 8 8.85071C6.78636 8.85069 5.79883 7.86318 5.79883 6.64954C5.79887 5.43593 6.78639 4.44839 8 4.44836ZM8 5.08997C7.14108 5.08999 6.44047 5.79062 6.44043 6.64954C6.44043 7.50848 7.14106 8.20908 8 8.20911C8.85896 8.20911 9.55957 7.5085 9.55957 6.64954C9.55953 5.79061 8.85894 5.08997 8 5.08997Z"
                  fill="#999"
                />
              </svg>
              {property.location}
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">{property.description}</p>

            {property.equipments && property.equipments.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {property.equipments.map((equipment, i) => (
                    <span key={i} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">
                      {equipment}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.categories && property.categories.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {property.categories.map((category, i) => (
                    <span key={i} className="bg-kasa-bg text-gray-700 px-3 py-1 rounded text-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={property.host.picture}
                  alt={property.host.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-gray-900">{property.host.name}</p>
                <div className="flex gap-1">
                  {[...Array(Math.round(property.rating_avg))].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold text-kasa-dark-red">
                {property.price_per_night}€
              </p>
              <p className="text-gray-600 text-sm">par nuit</p>
            </div>

            <button className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium hover:opacity-90 mb-3">
              Contacter l'hôte
            </button>
            <button className="w-full border border-kasa-dark-red text-kasa-dark-red py-3 rounded-lg font-medium hover:bg-kasa-bg">
              Envoyer un message
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
