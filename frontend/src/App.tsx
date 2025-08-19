// App.tsx refatorado com React Router DOM
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import InscricoesFlow from './components/InscricoesFlow';
import Contato from './pages/ContatoPage';
import GenericPage from './pages/GenericPage';
import Header from './components/Header';
import Footer from './components/Footer';
import MenuItem from './components/MenuItem';
import ApiService from './services/api';
import { 
  type ContactForm, 
} from './types';

const App = () => {
  // Estados globais
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
  
  // Estados gerais
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Menu items (removidas as páginas solicitadas)
  const menuItems = [
    { id: 'home', label: 'Home', path: '/' }, 
    { id: 'festival', label: 'Festival', path: '/festival' },
    { id: 'inscricoes', label: 'Inscrições', path: '/inscricoes' }, 
    { id: 'masterclass', label: 'Masterclass', path: '/masterclass' }, 
    { id: 'edicoes', label: 'Edições', path: '/edicoes' },
    { id: 'contato', label: 'Contato', path: '/contato' }
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

  // Função para lidar com sucesso da inscrição
  const handleInscricaoSuccess = () => {
    showSuccessMessage('Inscrição realizada com sucesso!');
  };

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 text-stone-800 dark:bg-stone-900 dark:text-stone-200 transition-colors duration-300">
        <Header 
          menuItems={menuItems}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
        
        <MenuItem 
          menuItems={menuItems}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />

        <main className="pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/inscricoes" 
              element={
                <InscricoesFlow 
                  onSuccess={handleInscricaoSuccess}
                />
              } 
            />
            
            <Route 
              path="/contato" 
              element={
                <Contato 
                  contactForm={contactForm}
                  setContactForm={setContactForm}
                  handleContactSubmit={handleContactSubmit}
                  isSubmitting={isSubmitting}
                />
              } 
            />
            
            <Route 
              path="/festival" 
              element={<GenericPage title="Festival" />} 
            />
            
            <Route 
              path="/masterclass" 
              element={<GenericPage title="Masterclass" />} 
            />
            
            <Route 
              path="/edicoes" 
              element={<GenericPage title="Edições" />} 
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;