'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import PropertyCard from '@/app/components/PropertyCard';
import { useAuth } from '@/app/context/AuthContext';
import { getProperties } from '@/lib/api';

interface Property {
  id: string;
  slug: string;
  title: string;
  cover: string;
  price_per_night: number;
  location: string;
}

export default function Favorites() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Redirect si pas connecté
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  // Charger favoris de l'utilisateur
  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/favorites`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      } finally {
        setPageLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-kasa-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vos favoris
          </h1>
          <p className="text-gray-600">
            Les logements que vous avez aimés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.length === 0 ? (
            <p className="text-gray-600 col-span-full text-center">
              Aucun favori pour le moment
            </p>
          ) : (
            properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onUnfavorite={(id) => setProperties(prev => prev.filter(p => p.id !== id))}
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
