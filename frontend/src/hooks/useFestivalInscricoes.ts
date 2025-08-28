// hooks/useFestivalInscricoes.ts
// Hook que funciona exclusivamente no frontend com dados do regulamento

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  EVENTOS_FESTIVAL, 
  filtrarEventos, 
  calcularPrecoInscricao,
  validarInscricao,
  ESTILOS_DANCA,
  MODALIDADES_PRECOS,
  CATEGORIAS_IDADE,
  type FestivalEvent
} from '../config/festivalEventsConfig';

interface DadosInscricao {
  nome: string;
  documento: string;
  email: string;
  celular: string;
  dataNascimento: string;
  escola?: string;
  coreografo?: string;
  autorizacaoCoreografo?: File;
  observacoes?: string;
  participantes?: { nome: string }[];
}

interface FiltrosEventos {
  estilo?: string;
  modalidade?: string;
  categoria?: string;
  idadeBailarino?: number;
  precMax?: number;
}

interface UseFestivalInscricoesState {
  // Eventos disponíveis e filtrados
  todosEventos: FestivalEvent[];
  eventosDisponiveis: FestivalEvent[];
  eventosSelecionados: string[];
  
  // Dados do formulário
  dadosInscricao: DadosInscricao;
  
  // Filtros e busca
  filtros: FiltrosEventos;
  textoBusca: string;
  
  // Estado da aplicação
  etapaAtual: 'selecao' | 'formulario' | 'pagamento' | 'confirmacao';
  carregando: boolean;
  erros: string[];
  
  // Cálculos
  precoTotal: number;
  resumoInscricao: {
    quantidadeEventos: number;
    estilosUnicos: string[];
    modalidadesUnicas: string[];
  };
}

export const useFestivalInscricoes = () => {
  const [state, setState] = useState<UseFestivalInscricoesState>({
    todosEventos: EVENTOS_FESTIVAL,
    eventosDisponiveis: EVENTOS_FESTIVAL,
    eventosSelecionados: [],
    dadosInscricao: {
      nome: '',
      documento: '',
      email: '',
      celular: '',
      dataNascimento: '',
      escola: '',
      coreografo: '',
      observacoes: ''
    },
    filtros: {},
    textoBusca: '',
    etapaAtual: 'selecao',
    carregando: false,
    erros: [],
    precoTotal: 0,
    resumoInscricao: {
      quantidadeEventos: 0,
      estilosUnicos: [],
      modalidadesUnicas: []
    }
  });

  // Calcular idade com base na data de nascimento
  const calcularIdade = useCallback((dataNascimento: string): number => {
    if (!dataNascimento) return 0;
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    
    if (hoje.getMonth() < nascimento.getMonth() || 
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }, []);

  // Aplicar filtros aos eventos
  const aplicarFiltros = useCallback(() => {
    let eventosFiltrados = [...state.todosEventos];
    
    // Aplicar filtros de categoria, modalidade, estilo
    if (Object.keys(state.filtros).length > 0) {
      eventosFiltrados = filtrarEventos(eventosFiltrados, state.filtros);
    }
    
    // Aplicar busca por texto
    if (state.textoBusca) {
      const termo = state.textoBusca.toLowerCase();
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.titulo.toLowerCase().includes(termo) ||
        evento.estilo.toLowerCase().includes(termo) ||
        evento.modalidade.toLowerCase().includes(termo) ||
        evento.descricao.toLowerCase().includes(termo)
      );
    }
    
    setState(prev => ({
      ...prev,
      eventosDisponiveis: eventosFiltrados
    }));
  }, [state.filtros, state.textoBusca, state.todosEventos]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros: Partial<FiltrosEventos>) => {
    setState(prev => ({
      ...prev,
      filtros: { ...prev.filtros, ...novosFiltros }
    }));
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setState(prev => ({
      ...prev,
      filtros: {},
      textoBusca: ''
    }));
  }, []);

  // Atualizar busca por texto
  const atualizarBusca = useCallback((texto: string) => {
    setState(prev => ({
      ...prev,
      textoBusca: texto
    }));
  }, []);

  // Selecionar/deselecionar evento
  const toggleEventoSelecao = useCallback((eventoId: string) => {
    setState(prev => {
      const jaSelecionado = prev.eventosSelecionados.includes(eventoId);
      const novosEventosSelecionados = jaSelecionado
        ? prev.eventosSelecionados.filter(id => id !== eventoId)
        : [...prev.eventosSelecionados, eventoId];
        
      return {
        ...prev,
        eventosSelecionados: novosEventosSelecionados
      };
    });
  }, []);

  // Atualizar dados da inscrição
  const atualizarDadosInscricao = useCallback((dados: Partial<DadosInscricao>) => {
    setState(prev => ({
      ...prev,
      dadosInscricao: { ...prev.dadosInscricao, ...dados }
    }));
  }, []);

  // Validar inscrição completa
  const validarInscricaoCompleta = useCallback((): { valida: boolean; erros: string[] } => {
    const erros: string[] = [];
    
    // Validar dados básicos
    if (!state.dadosInscricao.nome) erros.push('Nome é obrigatório');
    if (!state.dadosInscricao.documento) erros.push('Documento é obrigatório');
    if (!state.dadosInscricao.email) erros.push('Email é obrigatório');
    if (!state.dadosInscricao.celular) erros.push('Celular é obrigatório');
    if (!state.dadosInscricao.dataNascimento) erros.push('Data de nascimento é obrigatória');
    
    // Validar se pelo menos um evento foi selecionado
    if (state.eventosSelecionados.length === 0) {
      erros.push('Selecione pelo menos uma modalidade');
    }
    
    // Validar idade para eventos selecionados
    const idade = calcularIdade(state.dadosInscricao.dataNascimento);
    state.eventosSelecionados.forEach(eventoId => {
      const evento = state.todosEventos.find(e => e.id === eventoId);
      if (evento) {
        if (idade < evento.idadeMinima || idade > evento.idadeMaxima) {
          erros.push(`Idade ${idade} anos não é compatível com a categoria do evento "${evento.titulo}"`);
        }
      }
    });
    
    return { valida: erros.length === 0, erros };
  }, [state.dadosInscricao, state.eventosSelecionados, state.todosEventos, calcularIdade]);

  // Navegar entre etapas
  const irParaEtapa = useCallback((etapa: UseFestivalInscricoesState['etapaAtual']) => {
    if (etapa === 'formulario') {
      // Validar se há eventos selecionados antes de ir para o formulário
      if (state.eventosSelecionados.length === 0) {
        setState(prev => ({ ...prev, erros: ['Selecione pelo menos uma modalidade'] }));
        return;
      }
    }
    
    if (etapa === 'pagamento') {
      // Validar formulário antes de ir para pagamento
      const validacao = validarInscricaoCompleta();
      if (!validacao.valida) {
        setState(prev => ({ ...prev, erros: validacao.erros }));
        return;
      }
    }
    
    setState(prev => ({
      ...prev,
      etapaAtual: etapa,
      erros: []
    }));
  }, [state.eventosSelecionados.length, validarInscricaoCompleta]);

  // Resetar tudo
  const resetarInscricao = useCallback(() => {
    setState(prev => ({
      ...prev,
      eventosSelecionados: [],
      dadosInscricao: {
        nome: '',
        documento: '',
        email: '',
        celular: '',
        dataNascimento: '',
        escola: '',
        coreografo: '',
        observacoes: ''
      },
      etapaAtual: 'selecao',
      erros: [],
      filtros: {},
      textoBusca: ''
    }));
  }, []);

  // Calcular preço total e resumo automaticamente
  const calculos = useMemo(() => {
    const eventosSelecionadosDetalhes = state.eventosSelecionados
      .map(id => state.todosEventos.find(e => e.id === id))
      .filter(Boolean) as FestivalEvent[];
    
    const precoTotal = eventosSelecionadosDetalhes.reduce((total, evento) => {
      return total + evento.preco;
    }, 0);
    
    const estilosUnicos = [...new Set(eventosSelecionadosDetalhes.map(e => e.estilo))];
    const modalidadesUnicas = [...new Set(eventosSelecionadosDetalhes.map(e => e.modalidade))];
    
    return {
      precoTotal,
      resumoInscricao: {
        quantidadeEventos: eventosSelecionadosDetalhes.length,
        estilosUnicos,
        modalidadesUnicas
      },
      eventosSelecionadosDetalhes
    };
  }, [state.eventosSelecionados, state.todosEventos]);

  // Efeito para aplicar filtros quando mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  // Efeito para atualizar cálculos quando mudarem os eventos selecionados
  useEffect(() => {
    setState(prev => ({
      ...prev,
      precoTotal: calculos.precoTotal,
      resumoInscricao: calculos.resumoInscricao
    }));
  }, [calculos]);

  // Dados para componentes auxiliares
  const dadosAuxiliares = {
    estilosDisponiveis: Object.values(ESTILOS_DANCA),
    modalidadesDisponiveis: Object.values(MODALIDADES_PRECOS),
    categoriasDisponiveis: Object.values(CATEGORIAS_IDADE),
    eventosSelecionadosDetalhes: calculos.eventosSelecionadosDetalhes
  };

  return {
    // Estado
    ...state,
    
    // Funções de controle
    atualizarFiltros,
    limparFiltros,
    atualizarBusca,
    toggleEventoSelecao,
    atualizarDadosInscricao,
    irParaEtapa,
    resetarInscricao,
    validarInscricaoCompleta,
    calcularIdade,
    
    // Dados auxiliares
    ...dadosAuxiliares,
    
    // Utilitários
    filtrarEventos: (filtros: FiltrosEventos) => filtrarEventos(state.todosEventos, filtros),
    calcularPrecoInscricao,
    validarInscricao
  };
};