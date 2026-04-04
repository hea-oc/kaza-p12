import type { Metadata } from 'next';
import Header from './components/Header';
import PropertyCard from './components/PropertyCard';
import Footer from './components/Footer';
import { getProperties } from '@/lib/api';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: "Kasa — Location d'appartements entre particuliers",
  description: "Trouvez l'appartement ou la maison idéale pour vos vacances. Plus de 500 annonces chaque jour sur Kasa.",
  openGraph: {
    title: "Kasa — Location d'appartements entre particuliers",
    description: "Trouvez l'appartement ou la maison idéale pour vos vacances. Plus de 500 annonces chaque jour.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Kasa',
  },
};

export default async function Home() {
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-kasa-bg">
      <Navbar />
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <section
          className="mb-16"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <meta itemProp="name" content="Logements disponibles sur Kasa" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((property: any, index: number) => (
              <div key={property.id} itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <meta itemProp="position" content={String(index + 1)} />
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="bg-white rounded-2xl p-12 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Comment ça marche ?
            </h2>
            <p className="text-center text-gray-600 text-sm mb-10 max-w-3xl mx-auto">
              Que vous partiez pour un week-end improvisé, des vacances en famille ou un voyage professionnel,
              Kasa vous aide à trouver un lieu qui vous ressemble.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-kasa-dark-red text-white p-6 rounded-2xl cursor-pointer hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold mb-2">Recherchez</h3>
                <p className="text-xs leading-relaxed">
                  Entrez votre destination, vos dates et laissez Kasa faire le reste
                </p>
              </div>
              <div className="bg-kasa-dark-red text-white p-6 rounded-2xl cursor-pointer hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold mb-2">Réservez</h3>
                <p className="text-xs leading-relaxed">
                  Profitez d'une plateforme sécurisée et de profils d'hôtes vérifiés.
                </p>
              </div>
              <div className="bg-kasa-dark-red text-white p-6 rounded-2xl cursor-pointer hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold mb-2">Vivez l'expérience</h3>
                <p className="text-xs leading-relaxed">
                  Installez-vous, profitez de votre séjour, et sentez-vous chez vous, partout.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
