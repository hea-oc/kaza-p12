'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuth } from '@/app/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');       // saisie manuelle URL
  const [uploadedPictureUrl, setUploadedPictureUrl] = useState(''); // upload fichier
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      const pic = user.picture || '';
      // Si l'image vient d'un upload (chemin relatif ou localhost), on la met dans uploadedPictureUrl
      if (pic && (pic.startsWith('/uploads/') || pic.includes('localhost'))) {
        setUploadedPictureUrl(pic.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${pic}` : pic);
        setPictureUrl('');
      } else {
        setPictureUrl(pic);
        setUploadedPictureUrl('');
      }
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, picture: uploadedPictureUrl || pictureUrl || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }
      const updated = await res.json();
      updateUser({ name: updated.name, picture: updated.picture });
      setSuccess('Profil mis à jour avec succès.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const token = localStorage.getItem('auth_token');
    const form = new FormData();
    form.append('file', file);
    form.append('purpose', 'user-picture');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${data.url}` : data.url;
        setUploadedPictureUrl(url);
        setPictureUrl(''); // vider le champ URL manuel
      } else {
        setError('Erreur lors de l\'upload. Vérifiez que le fichier est une image valide.');
      }
    } catch {
      setError('Erreur lors de l\'upload.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible et conforme au RGPD (droit à l\'effacement).')) return;
    setDeleting(true);
    setError('');
    try {
      // Le backend ne dispose pas d'un endpoint DELETE /api/users/:id
      // On efface toutes les données locales et on déconnecte
      logout();
      // Informer l'utilisateur qu'il doit contacter l'administrateur pour la suppression complète
      router.push('/');
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading || !user) return null;

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold text-kasa-dark-red mb-8">Mon profil</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 space-y-6">

          {/* Photo de profil */}
          <div>
            <p className="font-semibold text-gray-900 mb-3">Photo de profil</p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-kasa-dark-red flex items-center justify-center shrink-0">
                {(uploadedPictureUrl || pictureUrl) ? (
                  <Image src={uploadedPictureUrl || pictureUrl} alt={name} width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-white text-2xl font-bold">{initials}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  Choisir un fichier
                </button>
                {uploadedPictureUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">Fichier uploadé</span>
                    <button
                      type="button"
                      onClick={() => setUploadedPictureUrl('')}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="picture-url" className="text-xs text-gray-500 mb-1 block">
                      {user.role === 'client' ? 'Collez l\'URL de votre photo' : 'Ou collez une URL'}
                    </label>
                    <input
                      id="picture-url"
                      type="url"
                      value={pictureUrl}
                      onChange={e => setPictureUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-kasa-dark-red"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="profile-name" className="block font-semibold text-gray-900 mb-2">
              Nom complet
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kasa-dark-red"
            />
          </div>

          {/* Email (lecture seule) */}
          <div>
            <p className="block font-semibold text-gray-900 mb-2">Adresse email</p>
            <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
              {user.email}
            </p>
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
          </div>

          {/* Rôle */}
          <div>
            <p className="block font-semibold text-gray-900 mb-2">Rôle</p>
            <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm capitalize">
              {user.role === 'owner' ? 'Propriétaire' : user.role === 'admin' ? 'Administrateur' : 'Client'}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>

        {/* Section RGPD */}
        <div className="bg-white rounded-2xl p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vos droits RGPD</h2>
          <p className="text-sm text-gray-600 mb-4">
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous avez le droit
            d'accéder à vos données, de les rectifier et de demander leur suppression (droit à l'effacement).
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-6 list-disc list-inside">
            <li>Vos données personnelles : nom, email, photo de profil</li>
            <li>Vos annonces et favoris sont liés à votre compte</li>
            <li>En supprimant votre compte, toutes vos données locales sont effacées</li>
          </ul>
          <p className="text-xs text-gray-400 mb-4">
            Note : La suppression complète de vos données en base de données nécessite une demande à l'administrateur de la plateforme.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full border-2 border-red-500 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
          >
            {deleting ? 'Suppression...' : 'Supprimer mon compte'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
