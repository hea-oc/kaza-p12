const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Génère un slug URL-friendly à partir d'un titre.
 * @param title - Le titre de la propriété
 * @returns Slug en minuscules avec tirets (ex: "appartement-cosy-paris")
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Récupère la liste de toutes les propriétés disponibles.
 * Les données sont mises en cache côté serveur pendant 1 heure (ISR).
 * @returns Tableau de propriétés avec slug garanti, ou tableau vide en cas d'erreur
 */
export async function getProperties() {
  try {
    const res = await fetch(`${API_URL}/api/properties`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch properties');
    }

    const properties = await res.json();
    return properties.map((property: any) => ({
      ...property,
      slug: property.slug || generateSlug(property.title)
    }));
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

/**
 * Récupère le détail complet d'une propriété par son identifiant.
 * Inclut les photos, équipements, tags et informations de l'hôte.
 * @param id - Identifiant numérique de la propriété
 * @returns Objet propriété complet, ou null si non trouvée
 */
export async function getPropertyById(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/properties/${id}`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch property');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

/**
 * Récupère le détail complet d'une propriété à partir de son slug.
 * Recherche d'abord le slug dans la liste, puis charge les détails par ID.
 * @param slug - Slug URL de la propriété (ex: "appartement-cosy-paris")
 * @returns Objet propriété complet, ou null si non trouvée
 */
export async function getPropertyBySlug(slug: string) {
  try {
    const properties = await getProperties();
    const property = properties.find((p: any) => p.slug === slug);
    if (!property) return null;

    return await getPropertyById(property.id);
  } catch (error) {
    console.error('Error fetching property by slug:', error);
    return null;
  }
}

/**
 * Inscrit un nouvel utilisateur.
 * @param data - Données d'inscription (prénom, nom, email, mot de passe, rôle optionnel)
 * @returns Objet contenant le token JWT et les informations de l'utilisateur créé
 * @throws Error si l'email est déjà utilisé ou si les données sont invalides
 */
export async function register(data: { first_name: string; last_name: string; email: string; password: string; role?: string }) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        role: data.role || 'client'
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await res.json();
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
}

/**
 * Connecte un utilisateur avec ses identifiants.
 * @param email - Adresse email de l'utilisateur
 * @param password - Mot de passe de l'utilisateur
 * @returns Objet contenant le token JWT et les informations de l'utilisateur
 * @throws Error si les identifiants sont invalides
 */
export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    return await res.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}
