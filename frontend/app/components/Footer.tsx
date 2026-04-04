import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-kasa-bg border-t border-gray-200 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div>
          <Image
            src="/kaza/logo/icone_picto.svg"
            alt="Kasa"
            width={40}
            height={40}
            style={{ height: 'auto' }}
          />
        </div>
        <p className="text-gray-600 text-xs">
          &copy; 2025 Kasa. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
