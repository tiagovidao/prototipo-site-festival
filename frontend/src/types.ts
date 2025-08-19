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
  currentRegistrations?: number;
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

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaymentData {
  payment_id: string;
  status: string;
  method: string;
  transaction_amount?: number;
  date_approved?: string;
}

export interface InscricaoRegistration {
  nome: string;
  documento: string;
  email: string;
  celular: string;
  dataNascimento: string;
  selectedEvents: string[];
  totalAmount: number;
  paymentId?: string;
  paymentStatus?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UseInscricoesState {
  availableEvents: Event[];
  selectedEvents: string[];
  formData: FormData;
  loadingState: LoadingState;
  apiError: string;
}

export interface UseInscricoesActions {
  loadEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  deselectEvent: (eventId: string) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetInscricoes: () => void;
  calculateTotal: () => number;
  isEventSelected: (eventId: string) => boolean;
  getSelectedEventsDetails: () => Event[];
}