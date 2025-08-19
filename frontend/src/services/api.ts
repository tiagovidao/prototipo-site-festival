// services/api.ts - ATUALIZADO (removendo createDonation)
import {type Event } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://festival-ballet-api.onrender.com/api'
  : 'http://localhost:3001/api';

class ApiService {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na requisição');
      }
      
      return response.json() as Promise<T>;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events');
  }

  // Validar se documento/email já existem
  async validateRegistrationData(documento: string, email: string): Promise<{
    isValid: boolean;
    conflicts: { type: 'documento' | 'email'; value: string; status?: string }[];
  }> {
    try {
      return await this.request<{
        isValid: boolean;
        conflicts: { type: 'documento' | 'email'; value: string; status?: string }[];
      }>('/registrations/validate', {
        method: 'POST',
        body: JSON.stringify({ documento, email }),
      });
    } catch (error) {
      console.error('Erro na validação:', error);
      // Em caso de erro na validação, permitir continuar (fallback)
      return { isValid: true, conflicts: [] };
    }
  }

  async createRegistration(registrationData: object): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async createContact(contactData: object): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
}

export default new ApiService();