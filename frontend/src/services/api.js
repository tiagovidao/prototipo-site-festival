const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }
      
      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  // Buscar eventos
  async getEvents() {
    return this.request('/events');
  }

  // Criar inscrição
  async createRegistration(registrationData) {
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // Enviar contato
  async createContact(contactData) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Registrar doação
  async createDonation(donationData) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }
}

export default new ApiService();