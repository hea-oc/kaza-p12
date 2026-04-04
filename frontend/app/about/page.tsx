import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Image from 'next/image';

export const metadata = {
  title: 'À propos - Kasa',
  description: 'En savoir plus sur Kasa et notre mission',
};

export default function About() {
  return (
    <div className="min-h-screen bg-kasa-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-kasa-dark-red mb-4">
            À propos
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chez Kasa, nous croiyons que chaque voyage mérite un endroit unique où se sentir chez soi.
          </p>
        </div>

        <div className="mb-12">
          <div className="relative h-80 rounded-2xl overflow-hidden bg-gray-300 mb-12">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop"
              alt="À propos de Kasa"
              fill
              className="object-cover"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-bold text-kasa-dark-red mb-4">
                Notre mission est simple :
              </h2>
              <ol className="text-gray-700 space-y-4">
                <li className="flex gap-3">
                  <span className="font-bold text-kasa-dark-red">1.</span>
                  <span>Offrir une plateforme fiable et simple d'utilisation.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-kasa-dark-red">2.</span>
                  <span>Protéger des hébergements variés et de qualité.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-kasa-dark-red">3.</span>
                  <span>Faciliter les échanges humains et chaleureux entre hôtes et voyageurs.</span>
                </li>
              </ol>
              <p className="text-kasa-dark-red italic mt-6">
                "Que vous cherchiez un appartement cosy en centre-ville, une maison dans la nature, Kasa vous accompagne pour faire de chaque séjour un souvenir inoubliable."
              </p>
            </div>

            <div className="relative h-72 rounded-2xl overflow-hidden bg-gray-300">
              <Image
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop"
                alt="Notre mission"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
