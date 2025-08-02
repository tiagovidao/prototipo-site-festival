import {type Event } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

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

  async createDonation(donationData: object): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }
}

export default new ApiService();