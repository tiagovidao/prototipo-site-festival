import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import FestivalInscricaoForm from './components/FestivalInscricaoForm';
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

  // Menu items atualizados para FID BSB
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

  // Conteúdo das páginas genéricas
  const pagesContent = {
    festival: {
      title: "2º Festival Internacional de Dança de Brasília",
      subtitle: "16 a 18 de Outubro de 2025",
      content: `
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-8 border border-purple-200 dark:border-purple-800">
            <h2 class="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">Sobre o Festival</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              O Festival Internacional de Dança de Brasília (FID BSB) é uma realização do <strong>Instituto Futuro Certo</strong> 
              em parceria com o <strong>Ministério do Turismo</strong> do Governo Federal.
            </p>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              A <strong>2ª edição</strong> acontece de <strong>16 a 18 de outubro de 2025</strong> no 
              <strong>Teatro Nacional Cláudio Santoro</strong>, em Brasília/DF.
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              O festival está aberto para bailarinos de todas as nacionalidades, a partir dos 9 anos de idade.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Estilos Contemplados</h3>
              <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Ballet Clássico de Repertório</li>
                <li>• Ballet Neoclássico</li>
                <li>• Dança Contemporânea</li>
                <li>• Jazz</li>
                <li>• Danças Urbanas</li>
                <li>• Danças Populares Brasileiras</li>
                <li>• Danças Tradicionais</li>
                <li>• Danças Livres</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Categorias por Idade</h3>
              <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>PRÉ:</strong> 9 a 11 anos</li>
                <li>• <strong>JÚNIOR:</strong> 12 a 14 anos</li>
                <li>• <strong>SENIOR:</strong> 15 a 19 anos</li>
                <li>• <strong>AVANÇADO:</strong> A partir dos 20 anos</li>
              </ul>
            </div>
          </div>

          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-3">
              📍 Local e Datas
            </h3>
            <div class="text-amber-800 dark:text-amber-200">
              <p class="mb-2"><strong>Mostra Competitiva:</strong> 16 a 18 de outubro de 2025</p>
              <p class="mb-2"><strong>Local:</strong> Palco "Em Movimento" e Sala Martins Pena</p>
              <p class="mb-2"><strong>Teatro Nacional Cláudio Santoro</strong></p>
              <p><strong>Brasília - DF</strong></p>
            </div>
          </div>
        </div>
      `
    },
    masterclass: {
      title: "Masterclasses",
      subtitle: "Workshops com Grandes Mestres da Dança",
      content: `
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
            <p class="text-gray-700 dark:text-gray-300 text-center text-lg">
              As masterclasses do FID BSB 2025 serão ministradas por renomados professores e coreógrafos 
              do cenário nacional e internacional da dança.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Para Diretores e Coordenadores</h3>
              <p class="text-gray-700 dark:text-gray-300 mb-4">
                Taxa especial de <strong>R$ 50,00</strong> para participação como OUVINTES em workshops selecionados.
              </p>
              <p class="text-gray-700 dark:text-gray-300">
                Uma oportunidade única de desenvolvimento profissional e networking.
              </p>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações</h3>
              <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Workshops em diversos estilos</li>
                <li>• Professores nacionais e internacionais</li>
                <li>• Certificados de participação</li>
                <li>• Networking profissional</li>
              </ul>
            </div>
          </div>

          <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-3">
              📅 Programação
            </h3>
            <p class="text-purple-800 dark:text-purple-200">
              A programação completa das masterclasses será divulgada em breve. 
              Acompanhe nossas redes sociais para mais informações!
            </p>
          </div>
        </div>
      `
    },
    edicoes: {
      title: "Edições Anteriores",
      subtitle: "História do Festival Internacional de Dança de Brasília",
      content: `
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-8 border border-green-200 dark:border-green-800">
            <h2 class="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">Nossa Trajetória</h2>
            <p class="text-gray-700 dark:text-gray-300">
              O Festival Internacional de Dança de Brasília nasceu com o propósito de promover e valorizar 
              a arte da dança em todas as suas manifestações, reunindo talentos do Brasil e do mundo.
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">2025 - 2ª Edição</h3>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 mb-2">8</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Estilos de Dança</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 mb-2">124</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Modalidades Disponíveis</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 mb-2">4</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Categorias de Idade</div>
              </div>
            </div>
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p class="text-gray-700 dark:text-gray-300">
                <strong>Novidades desta edição:</strong> Ampliação das modalidades, inclusão de novas categorias 
                e parcerias com o Ministério do Turismo, consolidando o FID BSB como um dos principais 
                eventos de dança do país.
              </p>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1ª Edição - Marcos Históricos</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              A primeira edição do Festival Internacional de Dança de Brasília marcou o início de uma 
              jornada dedicada à excelência artística e ao desenvolvimento da dança nacional.
            </p>
            <ul class="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Primeiro festival de dança de grande porte em Brasília</li>
              <li>• Participação de bailarinos de diferentes regiões do Brasil</li>
              <li>• Estabelecimento dos padrões de qualidade e organização</li>
              <li>• Criação da base para futuras edições</li>
            </ul>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
              🎯 Visão Futura
            </h3>
            <p class="text-blue-800 dark:text-blue-200">
              O FID BSB tem como meta se tornar um dos principais festivais de dança da América Latina, 
              promovendo intercâmbio cultural e desenvolvimento artístico em cada edição.
            </p>
          </div>
        </div>
      `
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col">
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
            {/* Página inicial */}
            <Route path="/" element={<Home />} />
            
            {/* Nova rota de inscrições com FestivalInscricaoForm */}
            <Route 
              path="/inscricoes" 
              element={<FestivalInscricaoForm />} 
            />
            
            {/* Página de contato */}
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
            
            {/* Páginas genéricas usando conteúdo dinâmico */}
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

            {/* Rota 404 - Página não encontrada */}
            <Route 
              path="*" 
              element={
                <GenericPage 
                  title="Página Não Encontrada"
                  subtitle="A página que você procura não existe"
                  content={`
                    <div class="text-center space-y-6">
                      <div class="text-9xl">🎭</div>
                      <p class="text-xl text-gray-600 dark:text-gray-400">
                        Ops! Parece que essa página saiu de cena.
                      </p>
                      <div class="pt-6">
                        <a href="/" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                          Voltar ao Início
                        </a>
                      </div>
                    </div>
                  `}
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