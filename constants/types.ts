// constants/types.ts

// Types pour les utilisateurs
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'patient' | 'medecin' | 'admin';
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
}

// Types pour les rendez-vous
export interface RendezVous {
  id: number;
  date: string; // "YYYY-MM-DD" ou ISO
  heure: string; // "09:00"
  typeConsultation: string;
  rappel: boolean;
  statut: 'confirme' | 'en_attente' | 'annule';
  medecin: {
    id: number;
    utilisateur: {
      nom: string;
      prenom: string;
    };
    specialite?: string;
  };
  patient: {
    id: number;
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  motDePasse: string;
}

export interface RegisterForm {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  dateNaissance: string;
  adresse: string;
  telephone: string;
}

export interface RendezVousForm {
  date: string;
  heure: string;
  typeConsultation: string;
  rappel: boolean;
  medecinId: number;
}

// Types pour les filtres et tri
export type RendezVousFilter = 'all' | 'upcoming' | 'past';
export type SortOrder = 'asc' | 'desc';

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: User;
  message?: string;
}

// Types pour les paramètres de navigation
export type RootStackParamList = {
  index: undefined;
  login: undefined;
  register: undefined;
  profil: undefined;
  rendezvous: undefined;
  'rendezvous/nouveau': undefined;
  'rendezvous/[id]': { id: string };
};

// Types pour les composants
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
  error?: string;
  required?: boolean;
}

