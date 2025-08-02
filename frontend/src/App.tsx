import React from 'react';
import Home from './pages/HomePage';
import Inscricoes from './pages/InscricoesPage';
import Formulario from './pages/FormularioPage';
import Contato from './pages/ContatoPage';
import Doacoes from './pages/DoacoesPage';
import GenericPage from './pages/GenericPage';
import Header from './components/Header';
import Footer from './components/Footer';
import MenuItem from './components/MenuItem';
import ApiService from './services/api';
import { 
  type Event, 
  type FormData, 
  type ContactForm, 
  type DonationForm, 
  type DonationStatus, 
  type LoadingState 
} from './types';

const App = () => {
  // Loading and error states
  const [loadingState, setLoadingState] = React.useState<LoadingState>('loading');
  const [apiError, setApiError] = React.useState<string>('');

  // Navigation state
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Data states
  const [availableEvents, setAvailableEvents] = React.useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([]);

  // Form states
  const [formData, setFormData] = React.useState<FormData>({ 
    nome: '', 
    documento: '', 
    email: '', 
    celular: '', 
    dataNascimento: '' 
  });

  const [contactForm, setContactForm] = React.useState<ContactForm>({ 
    nome: '', 
    email: '', 
    telefone: '', 
    cidade: '', 
    escola: '', 
    mensagem: '' 
  });

  const [donationForm, setDonationForm] = React.useState<DonationForm>({ 
    nome: '', 
    email: '', 
    comprovantes: [] 
  });

  // Status states
  const [donationStatus, setDonationStatus] = React.useState<DonationStatus>('idle');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Menu items
  const menuItems = [
    { id: 'home', label: 'Home' }, 
    { id: 'festival', label: 'Festival' },
    { id: 'inscricoes', label: 'Inscrições' }, 
    { id: 'edicao4', label: '4ª Edição' },
    { id: 'masterclass', label: 'Masterclass' }, 
    { id: 'edicoes', label: 'Edições' },
    { id: 'oportunidades', label: 'Oportunidades' }, 
    { id: 'doacoes', label: 'Doações' },
    { id: 'contato', label: 'Contato' }
  ];

  // Load events on component mount
  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingState('loading');
        setApiError('');
        
        const events = await ApiService.getEvents();
        setAvailableEvents(events);
        setLoadingState('success');
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        setApiError('Erro ao carregar eventos. Verifique sua conexão e tente novamente.');
        setLoadingState('error');
        
        // Fallback para dados estáticos em caso de erro
        setAvailableEvents([
          { id: 'ballet-junior', title: 'BALLET CLÁSSICO JÚNIOR', instructor: 'CLÁUDIA ZACCARI', date: '25/08/2025', time: '13:30 às 15:00h', location: 'SALA 01', price: 'R$ 250,00', available: false, vacancies: 0, totalVacancies: 15 },
          { id: 'ballet-pre', title: 'BALLET CLÁSSICO PRÉ', instructor: 'CARIDAD MARTINEZ', date: '25/08/2025', time: '15:00 às 16:30h', location: 'SALA 01', price: 'R$ 250,00', available: true, vacancies: 5, totalVacancies: 15 },
          { id: 'ballet-contemporaneo', title: 'BALLET CONTEMPORÂNEO', instructor: 'FELIPE SILVA', date: '26/08/2025', time: '10:00 às 12:00h', location: 'SALA 02', price: 'R$ 200,00', available: true, vacancies: 3, totalVacancies: 10 },
          { id: 'ballet-avancado', title: 'BALLET AVANÇADO', instructor: 'AMANDA COSTA', date: '27/08/2025', time: '14:00 às 16:00h', location: 'SALA 03', price: 'R$ 220,00', available: true, vacancies: 8, totalVacancies: 12 },
          { id: 'ballet-infantil', title: 'BALLET INFANTIL', instructor: 'RAFAEL SANTOS', date: '28/08/2025', time: '16:30 às 18:30h', location: 'SALA 01', price: 'R$ 180,00', available: true, vacancies: 2, totalVacancies: 10 },
          { id: 'ballet-iniciante', title: 'BALLET INICIANTE', instructor: 'JULIANA OLIVEIRA', date: '29/08/2025', time: '09:00 às 11:00h', location: 'SALA 04', price: 'R$ 240,00', available: false, vacancies: 0, totalVacancies: 8 }
        ]);
      }
    };

    loadEvents();
  }, []);

  // Utility functions
  const calculateTotal = (eventIds: string[]): number => {
    return eventIds.reduce((total, eventId) => {
      const event = availableEvents.find(e => e.id === eventId);
      return total + (event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0);
    }, 0);
  };

  const resetForms = () => {
    setFormData({ nome: '', documento: '', email: '', celular: '', dataNascimento: '' });
    setContactForm({ nome: '', email: '', telefone: '', cidade: '', escola: '', mensagem: '' });
    setDonationForm({ nome: '', email: '', comprovantes: [] });
    setSelectedEvents([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const showSuccessMessage = (message: string) => {
    alert(message);
  };

  const showErrorMessage = (message: string) => {
    alert(message);
  };

  // Event handlers
  const handleEventSelection = (eventId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    if (!event || !event.available || event.vacancies <= 0) return;

    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['nome', 'documento', 'email', 'celular', 'dataNascimento'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      showErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (selectedEvents.length === 0) {
      showErrorMessage('Por favor, selecione pelo menos um evento.');
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = calculateTotal(selectedEvents);
      
      await ApiService.createRegistration({
        ...formData,
        selectedEvents,
        totalAmount
      });

      showSuccessMessage('Inscrição realizada com sucesso!');
      resetForms();
      setCurrentPage('home');
    } catch (error) {
      console.error('Erro ao realizar inscrição:', error);
      showErrorMessage(`Erro ao realizar inscrição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.nome.trim() || !contactForm.mensagem.trim()) {
      showErrorMessage('Por favor, preencha os campos obrigatórios (Nome e Mensagem).');
      return;
    }

    setIsSubmitting(true);

    try {
      await ApiService.createContact(contactForm);
      showSuccessMessage('Mensagem enviada com sucesso!');
      setContactForm({ nome: '', email: '', telefone: '', cidade: '', escola: '', mensagem: '' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showErrorMessage(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationForm.nome.trim() || !donationForm.email.trim() || donationForm.comprovantes.length === 0) {
      showErrorMessage('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um comprovante.');
      return;
    }

    setDonationStatus('uploading');

    try {
      // Convert files to names for API (in production, you'd upload files to storage first)
      const comprovantesNames = donationForm.comprovantes.map(file => file.name);
      
      await ApiService.createDonation({
        nome: donationForm.nome,
        email: donationForm.email,
        comprovantes: comprovantesNames
      });

      setDonationStatus('success');
      showSuccessMessage('Doação registrada com sucesso! Verificaremos seus comprovantes em breve.');
      setDonationForm({ nome: '', email: '', comprovantes: [] });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setTimeout(() => setDonationStatus('idle'), 3000);
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      setDonationStatus('error');
      showErrorMessage(`Erro ao registrar doação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setTimeout(() => setDonationStatus('idle'), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files);
      setDonationForm(prev => ({
        ...prev,
        comprovantes: [...prev.comprovantes, ...newFiles]
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setDonationForm(prev => ({
      ...prev,
      comprovantes: prev.comprovantes.filter((_, i) => i !== index)
    }));
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleRetryLoadEvents = () => {
    window.location.reload();
  };

  // Render loading state
  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-800 dark:bg-stone-900 dark:text-stone-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (loadingState === 'error' && availableEvents.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-800 dark:bg-stone-900 dark:text-stone-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Erro ao Carregar</h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6">{apiError}</p>
          <button 
            onClick={handleRetryLoadEvents}
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-md transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Render content based on current page
  const renderContent = () => {
    // Show API error banner if there's an error but we have fallback data
    const ErrorBanner = apiError && (
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              {apiError} Usando dados em cache.
            </p>
          </div>
        </div>
      </div>
    );

    switch (currentPage) {
      case 'home': 
        return (
          <>
            {ErrorBanner}
            <Home navigateTo={navigateTo} />
          </>
        );
        
      case 'inscricoes': 
        return (
          <>
            {ErrorBanner}
            <Inscricoes 
              availableEvents={availableEvents}
              selectedEvents={selectedEvents}
              handleEventSelection={handleEventSelection}
              onContinue={() => setCurrentPage('formulario')}
            />
          </>
        );
        
      case 'formulario': 
        return (
          <>
            {ErrorBanner}
            <Formulario 
              selectedEvents={selectedEvents}
              availableEvents={availableEvents}
              formData={formData}
              setFormData={setFormData}
              handleFormSubmit={handleFormSubmit}
              onBack={() => setCurrentPage('inscricoes')}
              isSubmitting={isSubmitting}
            />
          </>
        );
        
      case 'contato': 
        return (
          <>
            {ErrorBanner}
            <Contato 
              contactForm={contactForm}
              setContactForm={setContactForm}
              handleContactSubmit={handleContactSubmit}
              isSubmitting={isSubmitting}
            />
          </>
        );
        
      case 'doacoes': 
        return (
          <>
            {ErrorBanner}
            <Doacoes 
              donationForm={donationForm}
              setDonationForm={setDonationForm}
              donationStatus={donationStatus}
              handleDonationSubmit={handleDonationSubmit}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              fileInputRef={fileInputRef}
            />
          </>
        );
        
      case 'festival':
      case 'edicao4':
      case 'masterclass':
      case 'edicoes':
      case 'oportunidades':
        return (
          <>
            {ErrorBanner}
            <GenericPage title={menuItems.find(item => item.id === currentPage)?.label || currentPage} />
          </>
        );
        
      default: 
        return (
          <>
            {ErrorBanner}
            <Home navigateTo={navigateTo} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 dark:bg-stone-900 dark:text-stone-200 transition-colors duration-300">
      <Header 
        menuItems={menuItems}
        currentPage={currentPage}
        navigateTo={navigateTo}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      
      <MenuItem 
        menuItems={menuItems}
        currentPage={currentPage}
        navigateTo={navigateTo}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <main className="pb-16">
        {renderContent()}
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default App;