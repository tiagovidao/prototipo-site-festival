// App.tsx refatorado com arquitetura modular
import React from 'react';
import Home from './pages/HomePage';
import InscricoesFlow from './components/InscricoesFlow'; // Novo componente
import Contato from './pages/ContatoPage';
import Doacoes from './pages/DoacoesPage';
import GenericPage from './pages/GenericPage';
import Header from './components/Header';
import Footer from './components/Footer';
import MenuItem from './components/MenuItem';
import ApiService from './services/api';
import { 
  type ContactForm, 
  type DonationForm, 
  type DonationStatus
} from './types';

const App = () => {
  // Estados globais (não relacionados às inscrições)
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Estados de contato
  const [contactForm, setContactForm] = React.useState<ContactForm>({ 
    nome: '', 
    email: '', 
    telefone: '', 
    cidade: '', 
    escola: '', 
    mensagem: '' 
  });
  
  // Estados de doação
  const [donationForm, setDonationForm] = React.useState<DonationForm>({ 
    nome: '', 
    email: '', 
    comprovantes: [] 
  });
  const [donationStatus, setDonationStatus] = React.useState<DonationStatus>('idle');
  
  // Estados gerais
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

  // Funções utilitárias
  const showSuccessMessage = (message: string) => {
    alert(message);
  };

  const showErrorMessage = (message: string) => {
    alert(message);
  };

  const resetContactForm = () => {
    setContactForm({ nome: '', email: '', telefone: '', cidade: '', escola: '', mensagem: '' });
  };

  const resetDonationForm = () => {
    setDonationForm({ nome: '', email: '', comprovantes: [] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handlers de contato
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
      resetContactForm();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showErrorMessage(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers de doação
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationForm.nome.trim() || !donationForm.email.trim() || donationForm.comprovantes.length === 0) {
      showErrorMessage('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um comprovante.');
      return;
    }

    setDonationStatus('uploading');

    try {
      const comprovantesNames = donationForm.comprovantes.map(file => file.name);
      
      await ApiService.createDonation({
        nome: donationForm.nome,
        email: donationForm.email,
        comprovantes: comprovantesNames
      });

      setDonationStatus('success');
      showSuccessMessage('Doação registrada com sucesso! Verificaremos seus comprovantes em breve.');
      resetDonationForm();
      
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

  // Navegação
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Função para lidar com sucesso da inscrição
  const handleInscricaoSuccess = () => {
    showSuccessMessage('Inscrição realizada com sucesso!');
    setCurrentPage('home');
  };

  // Renderização do conteúdo baseado na página atual
  const renderContent = () => {
    switch (currentPage) {
      case 'home': 
        return <Home navigateTo={navigateTo} />;
        
      // Todas as páginas relacionadas às inscrições agora são um fluxo isolado
      case 'inscricoes':
        return (
          <InscricoesFlow 
            onSuccess={handleInscricaoSuccess}
            onCancel={() => setCurrentPage('home')}
          />
        );
        
      case 'contato': 
        return (
          <Contato 
            contactForm={contactForm}
            setContactForm={setContactForm}
            handleContactSubmit={handleContactSubmit}
            isSubmitting={isSubmitting}
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
        return (
          <GenericPage title={menuItems.find(item => item.id === currentPage)?.label || currentPage} />
        );
        
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

      <main className="pb-16">
        {renderContent()}
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default App;