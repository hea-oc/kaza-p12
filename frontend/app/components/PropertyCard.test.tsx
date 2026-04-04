import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PropertyCard from './PropertyCard';

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} />;
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockProperty = {
  id: '1',
  slug: 'appartement-cosy',
  title: 'Appartement cosy',
  cover: 'https://example.com/cover.jpg',
  price_per_night: 100,
  location: 'Île de France - Paris 17e',
};

// Helper pour mocker useAuth
const mockUseAuth = vi.fn();

vi.mock('@/app/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PropertyCard — favoris', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() },
      writable: true,
    });
    // Mock fetch global
    global.fetch = vi.fn();
  });

  it('affiche le titre, la localisation et le prix', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('Appartement cosy')).toBeInTheDocument();
    expect(screen.getByText('Île de France - Paris 17e')).toBeInTheDocument();
    expect(screen.getByText('100€')).toBeInTheDocument();
  });

  it('affiche le bouton favori', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<PropertyCard property={mockProperty} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('sauvegarde dans localStorage au clic sans token (non connecté)', () => {
    render(<PropertyCard property={mockProperty} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('ne fait pas d\'appel API si aucun token dans localStorage', () => {
    render(<PropertyCard property={mockProperty} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('appelle l\'API favori en POST quand un token est présent', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => {
          if (key === 'auth_token') return 'fake-token';
          if (key === 'auth_user') return JSON.stringify({ id: 'u1', name: 'Jean' });
          if (key === 'kasa_favorites') return '[]';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

    render(<PropertyCard property={mockProperty} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toContain(`/api/properties/${mockProperty.id}/favorite`);
    expect(call[1].method).toBe('POST');
  });

  it('appelle l\'API en DELETE si le logement est déjà en favori', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => {
          if (key === 'auth_token') return 'fake-token';
          if (key === 'auth_user') return JSON.stringify({ id: 'u1', name: 'Jean' });
          if (key === 'kasa_favorites') return JSON.stringify([mockProperty.id]);
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

    render(<PropertyCard property={mockProperty} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe('DELETE');
  });

  it('redirige vers la page de la propriété au clic sur la card', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<PropertyCard property={mockProperty} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/property/appartement-cosy');
  });
});
