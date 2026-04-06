'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuth } from '@/app/context/AuthContext';

const EQUIPMENTS = [
  'Micro-Ondes', 'Douche italienne', 'Frigo', 'WIFI', 'Parking',
  'Sèche Cheveux', 'Machine à laver', 'Cuisine équipée', 'Télévision', 'Chambre Séparée',
  'Climatisation', 'Frigo Américain',
  'Clic-clac', 'Four', 'Rangements', 'Lit', 'Bouilloire', 'SDB', 'Toilettes sèches',
  'Cintres', 'Baie vitrée', 'Hotte', 'Baignoire', 'Vue Parc',
];

const CATEGORIES = ['Parc', 'Night Life', 'Culture', 'Nature', 'Touristique', 'Vue sur mer', 'Pour les couples', 'Famille', 'Forêt'];

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Fichiers et previews
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [propertyPreviews, setPropertyPreviews] = useState<string[]>([]);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const propertyInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    postal_code: '',
    price_per_night: '',
    host_name: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipments(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addCustomTag = () => {
    if (newTag.trim() && !selectedCategories.includes(newTag)) {
      setSelectedCategories(prev => [...prev, newTag]);
      setNewTag('');
    }
  };

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

  const validateSize = (file: File): boolean => {
    if (file.size > MAX_SIZE_BYTES) {
      alert(`"${file.name}" est trop volumineuse (${(file.size / 1024 / 1024).toFixed(1)} Mo). La taille maximale est de 10 Mo.`);
      return false;
    }
    return true;
  };

  // Lecture d'un fichier vers data URL pour preview
  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateSize(file)) { e.target.value = ''; return; }
    const url = await readFileAsDataURL(file);
    setCoverPreview(url);
  };

  const handlePropertyImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(validateSize);
    if (!files.length) return;
    const urls = await Promise.all(files.map(readFileAsDataURL));
    setPropertyPreviews(prev => [...prev, ...urls]);
  };

  const handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateSize(file)) { e.target.value = ''; return; }
    const url = await readFileAsDataURL(file);
    setProfilePreview(url);
  };

  // Upload d'un fichier vers le backend
  const uploadFile = async (dataUrl: string, filename: string): Promise<string> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const form = new FormData();
    form.append('file', blob, filename);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      body: form,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Erreur upload (${response.status})`);
    }
    const data = await response.json();
    const url = data.url;
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) return setFormError('Le titre est obligatoire.');
    if (!formData.description.trim()) return setFormError('La description est obligatoire.');
    if (!formData.location.trim()) return setFormError('La localisation est obligatoire.');
    if (!formData.price_per_night) return setFormError('Le prix par nuit est obligatoire.');
    if (!coverPreview && propertyPreviews.length === 0) return setFormError('Ajoutez au moins une photo.');

    setLoading(true);

    try {
      const coverUrl = coverPreview
        ? await uploadFile(coverPreview, 'cover.jpg')
        : 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800';

      const pictureUrls = await Promise.all(
        propertyPreviews.map((p, i) => uploadFile(p, `image-${i}.jpg`))
      );

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          postal_code: formData.postal_code,
          price_per_night: parseInt(formData.price_per_night),
          cover: coverUrl,
          pictures: pictureUrls,
          equipments: selectedEquipments,
          tags: selectedCategories,
          host_id: user!.id,
        }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        alert('Erreur lors de la création');
      }
    } catch {
      alert('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
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

  if (user.role === 'client' || user.role === undefined) {
    return (
      <div className="min-h-screen bg-kasa-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
            <p className="text-4xl mb-4">🏠</p>
            <h1 className="text-xl font-bold text-gray-900 mb-3">Compte propriétaire requis</h1>
            <p className="text-gray-600 text-sm mb-6">
              Pour publier un logement, vous devez avoir un compte propriétaire.
              Créez un nouveau compte en cochant <span className="font-medium">"Je souhaite publier des logements"</span> lors de l'inscription.
            </p>
            <a href="/signup" className="inline-block bg-kasa-dark-red text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition">
              Créer un compte propriétaire
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {formError}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ajouter une propriété</h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-kasa-dark-red text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Ajouter'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block font-semibold text-gray-900 mb-2">Titre de la propriété</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Appartement cosy au coeur de paris"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasa-dark-red"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block font-semibold text-gray-900 mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre propriété en détail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasa-dark-red h-32"
                required
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="block font-semibold text-gray-900 mb-2">Code postal</label>
              <input
                id="postal_code"
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="75001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasa-dark-red"
              />
            </div>

            <div>
              <label htmlFor="location" className="block font-semibold text-gray-900 mb-2">Localisation</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Île de France - Paris 1er"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasa-dark-red"
                required
              />
            </div>

            <div>
              <label htmlFor="price_per_night" className="block font-semibold text-gray-900 mb-2">Prix par nuit (€)</label>
              <input
                id="price_per_night"
                type="number"
                name="price_per_night"
                value={formData.price_per_night}
                onChange={handleInputChange}
                placeholder="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasa-dark-red"
                required
              />
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">

            {/* Image de couverture */}
            <div>
              <label htmlFor="cover-input" className="block font-semibold text-gray-900 mb-2">Image de couverture</label>
              <input
                id="cover-input"
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverPreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                  <Image src={coverPreview} alt="Aperçu couverture" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <span className="bg-kasa-dark-red text-white w-8 h-8 rounded flex items-center justify-center text-xl font-light">+</span>
                </button>
              )}
            </div>

            {/* Images du logement */}
            <div>
              <label htmlFor="property-images-input" className="block font-semibold text-gray-900 mb-2">Images du logement</label>
              <input
                id="property-images-input"
                ref={propertyInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePropertyImagesChange}
              />
              {propertyPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {propertyPreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded overflow-hidden group">
                      <Image src={src} alt={`Image ${i + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setPropertyPreviews(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full w-5 h-5 flex items-center justify-center text-gray-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => propertyInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
              >
                <span className="bg-kasa-dark-red text-white w-8 h-8 rounded flex items-center justify-center text-xl font-light">+</span>
              </button>
              <p className="text-sm text-kasa-dark-red mt-1 cursor-pointer" onClick={() => propertyInputRef.current?.click()}>
                +Ajouter une image
              </p>
            </div>

            {/* Nom de l'hôte */}
            <div>
              <label htmlFor="host_name" className="block font-semibold text-gray-900 mb-2">Nom de l'hôte</label>
              <input
                id="host_name"
                type="text"
                name="host_name"
                value={formData.host_name}
                onChange={handleInputChange}
                placeholder="Prénom Nom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasa-dark-red"
                required
              />
            </div>

            {/* Photo de profil */}
            <div>
              <label htmlFor="profile-input" className="block font-semibold text-gray-900 mb-2">Photo de profil</label>
              <input
                id="profile-input"
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileChange}
              />
              {profilePreview ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden group">
                  <Image src={profilePreview} alt="Aperçu profil" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => { setProfilePreview(null); if (profileInputRef.current) profileInputRef.current.value = ''; }}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full w-5 h-5 flex items-center justify-center text-gray-700 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <span className="bg-kasa-dark-red text-white w-8 h-8 rounded flex items-center justify-center text-xl font-light">+</span>
                </button>
              )}
              <p className="text-sm text-kasa-dark-red mt-1 cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                +Ajouter une image
              </p>
            </div>
          </div>
        </form>

        {/* Équipements */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Équipements</h2>
          <div className="grid grid-cols-2 gap-3">
            {EQUIPMENTS.map(eq => (
              <label key={eq} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEquipments.includes(eq)}
                  onChange={() => toggleEquipment(eq)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{eq}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Catégories */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Catégories</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedCategories.includes(cat)
                    ? 'bg-kasa-dark-red text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label htmlFor="new-tag" className="block font-semibold text-gray-900 mb-2">Ajouter une catégorie personnalisée</label>
          <div className="flex gap-2">
            <input
              id="new-tag"
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Nouveau tag"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasa-dark-red"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="bg-kasa-dark-red text-white w-10 h-10 rounded-lg font-medium hover:opacity-90 flex items-center justify-center text-xl"
            >
              +
            </button>
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategories.map(cat => (
                <span
                  key={cat}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="text-gray-500 hover:text-gray-900 ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-kasa-dark-red mt-2 cursor-pointer" onClick={addCustomTag}>
            +Ajouter un tag
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
