import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Carousel from './Carousel';

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('Carousel', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ];

  it('affiche un message quand aucune image n\'est fournie', () => {
    render(<Carousel images={[]} alt="Test" />);
    expect(screen.getByText('Aucune image disponible')).toBeInTheDocument();
  });

  it('affiche une seule image sans boutons de navigation', () => {
    const { container } = render(
      <Carousel images={['https://example.com/image1.jpg']} alt="Test" />
    );
    // Image unique : l'alt est juste la prop alt, sans suffixe
    expect(screen.getByAltText('Test')).toBeInTheDocument();
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('affiche plusieurs images avec deux boutons de navigation', () => {
    const { container } = render(<Carousel images={mockImages} alt="Test" />);
    expect(screen.getByAltText('Test - Image 1')).toBeInTheDocument();
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('affiche l\'indicateur de page correct', () => {
    render(<Carousel images={mockImages} alt="Test" />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('passe à l\'image suivante au clic sur le bouton suivant', () => {
    render(<Carousel images={mockImages} alt="Test" />);
    const nextButton = screen.getByLabelText('Image suivante');
    fireEvent.click(nextButton);
    expect(screen.getByAltText('Test - Image 2')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('passe à l\'image précédente au clic sur le bouton précédent', () => {
    render(<Carousel images={mockImages} alt="Test" />);
    const nextButton = screen.getByLabelText('Image suivante');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    const prevButton = screen.getByLabelText('Image précédente');
    fireEvent.click(prevButton);
    expect(screen.getByAltText('Test - Image 2')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('revient à la première image après la dernière (boucle)', () => {
    render(<Carousel images={mockImages} alt="Test" />);
    const nextButton = screen.getByLabelText('Image suivante');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(screen.getByAltText('Test - Image 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('revient à la dernière image en cliquant précédent sur la première (boucle)', () => {
    render(<Carousel images={mockImages} alt="Test" />);
    const prevButton = screen.getByLabelText('Image précédente');
    fireEvent.click(prevButton);
    expect(screen.getByAltText('Test - Image 3')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('parcourt toutes les images dans l\'ordre', () => {
    render(<Carousel images={mockImages} alt="Test" />);
    const nextButton = screen.getByLabelText('Image suivante');
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    fireEvent.click(nextButton);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    fireEvent.click(nextButton);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });
});
