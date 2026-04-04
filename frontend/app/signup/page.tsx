'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuth } from '@/app/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { user, signup: authSignup } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    terms: false,
    is_owner: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect si déjà connecté
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!formData.terms) {
      setError('Vous devez accepter les conditions générales');
      setLoading(false);
      return;
    }

    try {
      await authSignup(
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.password,
        formData.is_owner ? 'owner' : 'client'
      );
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl p-12 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-kasa-dark-red text-center mb-2">
            Rejoignez la communauté Kasa
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Créez votre compte et commencez à voyager autrement : réservez des logements uniques, découvrez de nouvelles destinations et partagez vos propres lieux avec d'autres voyageurs.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-gray-700 font-medium mb-2">
                  Nom
                </label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kasa-dark-red"
                  placeholder="Jean"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-gray-700 font-medium mb-2">
                  Prénom
                </label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kasa-dark-red"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kasa-dark-red"
                placeholder="vous@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kasa-dark-red"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="is_owner"
                id="is_owner"
                checked={formData.is_owner}
                onChange={handleChange}
                className="mt-1 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="is_owner" className="text-sm text-gray-700 cursor-pointer">
                Je souhaite publier des logements <span className="text-kasa-dark-red font-medium">(compte propriétaire)</span>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                J'accepte les conditions générales d'utilisation
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Inscription en cours...' : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Déjà membre ?{' '}
              <Link href="/login" className="text-kasa-dark-red hover:text-kasa-red font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
