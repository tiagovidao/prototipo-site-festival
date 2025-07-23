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

const App = () => {
  // State management
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([]);
  const [formData, setFormData] = React.useState({ 
    nome: '', 
    documento: '', 
    email: '', 
    celular: '', 
    dataNascimento: '' 
  });
  const [contactForm, setContactForm] = React.useState({ 
    nome: '', 
    email: '', 
    telefone: '', 
    cidade: '', 
    escola: '', 
    mensagem: '' 
  });
  const [donationForm, setDonationForm] = React.useState({ 
    nome: '', 
    email: '', 
    comprovantes: [] as File[] 
  });
  const [donationStatus, setDonationStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
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

  // Event data
  const availableEvents = [
    { id: 'ballet-junior', title: 'BALLET CLÁSSICO JÚNIOR', instructor: 'CLÁUDIA ZACCARI', date: '25/08/2025', time: '13:30 às 15:00h', location: 'SALA 01', price: 'R$ 250,00', available: false, vacancies: 0, totalVacancies: 15 },
    { id: 'ballet-pre', title: 'BALLET CLÁSSICO PRÉ', instructor: 'CARIDAD MARTINEZ', date: '25/08/2025', time: '15:00 às 16:30h', location: 'SALA 01', price: 'R$ 250,00', available: true, vacancies: 5, totalVacancies: 15 },
    { id: 'ballet-contemporaneo', title: 'BALLET CONTEMPORÂNEO', instructor: 'FELIPE SILVA', date: '26/08/2025', time: '10:00 às 12:00h', location: 'SALA 02', price: 'R$ 200,00', available: true, vacancies: 3, totalVacancies: 10 },
    { id: 'ballet-avancado', title: 'BALLET AVANÇADO', instructor: 'AMANDA COSTA', date: '27/08/2025', time: '14:00 às 16:00h', location: 'SALA 03', price: 'R$ 220,00', available: true, vacancies: 8, totalVacancies: 12 },
    { id: 'ballet-infantil', title: 'BALLET INFANTIL', instructor: 'RAFAEL SANTOS', date: '28/08/2025', time: '16:30 às 18:30h', location: 'SALA 01', price: 'R$ 180,00', available: true, vacancies: 2, totalVacancies: 10 },
    { id: 'ballet-iniciante', title: 'BALLET INICIANTE', instructor: 'JULIANA OLIVEIRA', date: '29/08/2025', time: '09:00 às 11:00h', location: 'SALA 04', price: 'R$ 240,00', available: false, vacancies: 0, totalVacancies: 8 }
  ];

  // Handlers
  const handleEventSelection = (eventId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    if (event && event.available && event.vacancies > 0) {
      setSelectedEvents(prev => 
        prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome && formData.documento && formData.email && formData.celular && formData.dataNascimento) {
      alert('Inscrição realizada com sucesso!');
      setFormData({ nome: '', documento: '', email: '', celular: '', dataNascimento: '' });
      setSelectedEvents([]);
      setCurrentPage('home');
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.nome && contactForm.mensagem) {
      alert('Mensagem enviada com sucesso!');
      setContactForm({ nome: '', email: '', telefone: '', cidade: '', escola: '', mensagem: '' });
    } else {
      alert('Por favor, preencha os campos obrigatórios (Nome e Mensagem).');
    }
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.nome || !donationForm.email || donationForm.comprovantes.length === 0) {
      return alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um comprovante.');
    }
    setDonationStatus('uploading');
    setTimeout(() => {
      setDonationStatus('success');
      alert('Doação registrada com sucesso! Verificaremos seus comprovantes em breve.');
      setDonationForm({ nome: '', email: '', comprovantes: [] });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setDonationStatus('idle'), 3000);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setDonationForm(prev => ({
        ...prev,
        comprovantes: [...prev.comprovantes, ...Array.from(e.target.files!)]
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

  // Render content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'home': 
        return <Home navigateTo={navigateTo} />;
      case 'inscricoes': 
        return (
          <Inscricoes 
            availableEvents={availableEvents}
            selectedEvents={selectedEvents}
            handleEventSelection={handleEventSelection}
            onContinue={() => setCurrentPage('formulario')}
          />
        );
      case 'formulario': 
        return (
          <Formulario 
            selectedEvents={selectedEvents}
            availableEvents={availableEvents}
            formData={formData}
            setFormData={setFormData}
            handleFormSubmit={handleFormSubmit}
            onBack={() => setCurrentPage('inscricoes')}
          />
        );
      case 'contato': 
        return (
          <Contato 
            contactForm={contactForm}
            setContactForm={setContactForm}
            handleContactSubmit={handleContactSubmit}
          />
        );
      case 'doacoes': 
        return (
          <Doacoes 
            donationForm={donationForm}
            setDonationForm={setDonationForm}
            donationStatus={donationStatus}
            handleDonationSubmit={handleDonationSubmit}
            handleFileChange={handleFileChange}
            handleRemoveFile={handleRemoveFile}
            fileInputRef={fileInputRef}
          />
        );
      case 'festival':
      case 'edicao4':
      case 'masterclass':
      case 'edicoes':
      case 'oportunidades':
        return <GenericPage title={menuItems.find(item => item.id === currentPage)?.label || currentPage} />;
      default: 
        return <Home navigateTo={navigateTo} />;
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

      <main className="pb-16">{renderContent()}</main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default App;