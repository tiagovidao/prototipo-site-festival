import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import FestivalInscricaoForm from './pages/FestivalInscricaoForm';
import Contato from './pages/ContatoPage';
import GenericPage from './pages/GenericPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ApiService from './services/api';
import { 
  type ContactForm, 
} from './types';
import MenuItem from './components/MenuItem';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const [contactForm, setContactForm] = React.useState<ContactForm>({ 
    nome: '', 
    email: '', 
    telefone: '', 
    cidade: '', 
    escola: '', 
    mensagem: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', path: '/' }, 
    { id: 'festival', label: 'Festival', path: '/festival' },
    { id: 'inscricoes', label: 'Inscrições', path: '/inscricoes' }, 
    { id: 'masterclass', label: 'Masterclass', path: '/masterclass' }, 
    { id: 'edicoes', label: 'Edições', path: '/edicoes' },
    { id: 'contato', label: 'Contato', path: '/contato' }
  ];

  const showSuccessMessage = (message: string) => {
    alert(message);
  };

  const showErrorMessage = (message: string) => {
    alert(message);
  };

  const resetContactForm = () => {
    setContactForm({ nome: '', email: '', telefone: '', cidade: '', escola: '', mensagem: '' });
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
      resetContactForm();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showErrorMessage(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pagesContent = {
    festival: {
      title: "2º Festival Internacional de Dança de Brasília",
      subtitle: "16 a 18 de Outubro de 2025",
      content: `...` // mantive o conteúdo (sem alteração relevante)
    },
    masterclass: {
      title: "Masterclasses",
      subtitle: "Workshops com Grandes Mestres da Dança",
      content: `...`
    },
    edicoes: {
      title: "Edições Anteriores",
      subtitle: "História do Festival Internacional de Dança de Brasília",
      content: `...`
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 flex flex-col">
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
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* ajuste aqui: aceita sub-rotas /inscricoes/* */}
            <Route 
              path="/inscricoes/*" 
              element={<FestivalInscricaoForm />} 
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
              element={
                <GenericPage 
                  title={pagesContent.festival.title}
                  subtitle={pagesContent.festival.subtitle}
                  content={pagesContent.festival.content}
                />
              } 
            />
            
            <Route 
              path="/masterclass" 
              element={
                <GenericPage 
                  title={pagesContent.masterclass.title}
                  subtitle={pagesContent.masterclass.subtitle}
                  content={pagesContent.masterclass.content}
                />
              } 
            />
            
            <Route 
              path="/edicoes" 
              element={
                <GenericPage 
                  title={pagesContent.edicoes.title}
                  subtitle={pagesContent.edicoes.subtitle}
                  content={pagesContent.edicoes.content}
                />
              } 
            />

            <Route 
              path="*" 
              element={
                <GenericPage 
                  title="Página Não Encontrada"
                  subtitle="A página que você procura não existe"
                  content={`...`}
                />
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;
