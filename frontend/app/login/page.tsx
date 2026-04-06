'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect si déjà connecté
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
  // Gérer la soumission du formulaire de connexion
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authLogin(email, password); // Si succès, le contexte auth se met à jour et le useEffect ci-dessus redirige vers /
      router.push('/'); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full">
          <h1 className="text-3xl font-bold text-kasa-dark-red text-center mb-2">
            Heureux de vous revoir
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Connectez-vous pour retrouver vos réservations, vos annonces et tout ce qui rend vos séjours uniques.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kasa-dark-red"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p>
              <Link href="#" className="text-kasa-dark-red hover:text-kasa-red font-medium text-sm">
                Mot de passe oublié ?
              </Link>
            </p>
            <p className="text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/signup" className="text-kasa-dark-red hover:text-kasa-red font-medium">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
