// src/types.ts
export interface Event {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  price: string;
  available: boolean;
  vacancies: number;
  totalVacancies: number;
}

export interface FormData {
  nome: string;
  documento: string;
  email: string;
  celular: string;
  dataNascimento: string;
}

export interface ContactForm {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  escola: string;
  mensagem: string;
}

export interface DonationForm {
  nome: string;
  email: string;
  comprovantes: File[];
}

export type DonationStatus = 'idle' | 'uploading' | 'success' | 'error';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';