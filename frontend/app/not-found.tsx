import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-9xl font-bold text-kasa-dark-red mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-md">
          Il semble que la page que vous cherchez ait pris des vacances... ou n'ait jamais existé.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <Link
            href="/"
            className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium text-center hover:opacity-90 transition"
          >
            Accueil
          </Link>
          <Link
            href="/"
            className="w-full bg-kasa-dark-red text-white py-3 rounded-lg font-medium text-center hover:opacity-90 transition"
          >
            Logements
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
