'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Barre de navigation principale, présente sur toutes les pages.
 * - Desktop : liens horizontaux centrés avec logo au milieu
 * - Mobile : icône hamburger ouvrant un menu plein écran
 *
 * Affiche le nom de l'utilisateur connecté (cliquable vers /profile)
 * et le bouton de déconnexion si une session est active.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/login');
  };

  const handleMessagesClick = () => {
    setMenuOpen(false);
    router.push(user ? '/messages' : '/login');
  };

  return (
    <div className="bg-kasa-bg py-3">
      <div className="max-w-6xl mx-auto px-4">

        {/* Desktop navbar */}
        <nav className="bg-white rounded-xl px-4 py-2 hidden md:flex items-center justify-center gap-3 flex-wrap">
          <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium text-xs whitespace-nowrap">
            Accueil
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium text-xs whitespace-nowrap">
            À propos
          </Link>

          <Link href="/" className="shrink-0">
            <Image
              src="/kaza/logo/icone_Default.svg"
              alt="Kasa"
              width={80}
              height={28}
              priority
              style={{ width: '70px', height: 'auto' }}
            />
          </Link>

          <Link href="/add-property" className="text-kasa-dark-red font-medium text-xs hover:text-kasa-dark-red whitespace-nowrap">
            +Ajouter un logement
          </Link>

          <Link href="/favorites" className="hover:opacity-70 transition-opacity shrink-0">
            <Image src="/kaza/icones/icone_Favoris.svg" alt="Favoris" width={16} height={16} />
          </Link>

          <div className="w-px h-3 bg-gray-300" />

          <button onClick={handleMessagesClick} className="hover:opacity-70 transition-opacity shrink-0">
            <Image src="/kaza/icones/icone_Message.svg" alt="Messages" width={16} height={16} />
          </button>

          {user ? (
            <>
              <div className="w-px h-3 bg-gray-300" />
              <Link href="/profile" className="text-gray-700 hover:text-gray-900 font-medium text-xs whitespace-nowrap">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-kasa-red font-medium text-xs transition-colors whitespace-nowrap"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <div className="w-px h-3 bg-gray-300" />
              <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium text-xs whitespace-nowrap">
                Se connecter
              </Link>
            </>
          )}
        </nav>

        {/* Mobile navbar */}
        <nav className="bg-white rounded-xl px-4 py-2 flex md:hidden items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src="/kaza/logo/icone_picto.svg"
              alt="Kasa"
              width={36}
              height={36}
              priority
              style={{ width: '36px', height: 'auto' }}
            />
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="text-gray-800 hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col px-6 py-4 md:hidden">
            {/* Header du menu */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <Image
                  src="/kaza/logo/icone_picto.svg"
                  alt="Kasa"
                  width={36}
                  height={36}
                  style={{ width: '36px', height: 'auto' }}
                />
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="text-gray-800 hover:opacity-70 transition-opacity"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
            </div>

            {/* Liens */}
            <div className="flex flex-col divide-y divide-gray-100">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="py-4 text-lg text-gray-900 font-medium"
              >
                Accueil
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="py-4 text-lg text-gray-900 font-medium"
              >
                À propos
              </Link>
              <button
                onClick={handleMessagesClick}
                className="py-4 text-lg text-gray-900 font-medium text-left"
              >
                Messagerie
              </button>
              <Link
                href="/favorites"
                onClick={() => setMenuOpen(false)}
                className="py-4 text-lg text-gray-900 font-medium"
              >
                Favoris
              </Link>
            </div>

            <div className="mt-6">
              <Link
                href="/add-property"
                onClick={() => setMenuOpen(false)}
                className="bg-kasa-dark-red text-white px-5 py-2 rounded-lg font-medium text-sm inline-block hover:opacity-90 transition"
              >
                Ajouter un logement
              </Link>
            </div>

            {user ? (
              <div className="mt-6 flex flex-col gap-2">
                <span className="text-sm text-gray-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-kasa-red text-sm font-medium text-left hover:opacity-70"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-kasa-dark-red text-sm font-medium"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
