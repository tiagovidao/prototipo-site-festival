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

interface ParticipantesPorEvento {
  [eventoId: string]: number;
}

interface UseFestivalInscricoesState {
  todosEventos: FestivalEvent[];
  eventosDisponiveis: FestivalEvent[];
  eventosSelecionados: string[];
  participantesPorEvento: ParticipantesPorEvento;
  
  dadosInscricao: DadosInscricao;
  
  filtros: FiltrosEventos;
  textoBusca: string;
  
  etapaAtual: string;
  carregando: boolean;
  erros: string[];
  
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
    participantesPorEvento: {},
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

  const aplicarFiltros = useCallback(() => {
    let eventosFiltrados = [...state.todosEventos];
    
    if (Object.keys(state.filtros).length > 0) {
      eventosFiltrados = filtrarEventos(eventosFiltrados, state.filtros);
    }
    
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

  const atualizarFiltros = useCallback((novosFiltros: Partial<FiltrosEventos>) => {
    setState(prev => ({
      ...prev,
      filtros: { ...prev.filtros, ...novosFiltros }
    }));
  }, []);

  const limparFiltros = useCallback(() => {
    setState(prev => ({
      ...prev,
      filtros: {},
      textoBusca: ''
    }));
  }, []);

  const atualizarBusca = useCallback((texto: string) => {
    setState(prev => ({
      ...prev,
      textoBusca: texto
    }));
  }, []);

  const toggleEventoSelecao = useCallback((eventoId: string) => {
    setState(prev => {
      const jaSelecionado = prev.eventosSelecionados.includes(eventoId);
      const evento = prev.todosEventos.find(e => e.id === eventoId);
      
      if (jaSelecionado) {
        const novosEventosSelecionados = prev.eventosSelecionados.filter(id => id !== eventoId);
        const novosParticipantes = { ...prev.participantesPorEvento };
        delete novosParticipantes[eventoId];
        
        return {
          ...prev,
          eventosSelecionados: novosEventosSelecionados,
          participantesPorEvento: novosParticipantes
        };
      } else {
        const novosEventosSelecionados = [...prev.eventosSelecionados, eventoId];
        const numeroInicial = evento?.modalidade === 'Conjunto' ? 4 : 1;
        
        return {
          ...prev,
          eventosSelecionados: novosEventosSelecionados,
          participantesPorEvento: {
            ...prev.participantesPorEvento,
            [eventoId]: numeroInicial
          }
        };
      }
    });
  }, []);

  const atualizarParticipantesEvento = useCallback((eventoId: string, numeroParticipantes: number) => {
    setState(prev => ({
      ...prev,
      participantesPorEvento: {
        ...prev.participantesPorEvento,
        [eventoId]: numeroParticipantes
      }
    }));
  }, []);

  const atualizarDadosInscricao = useCallback((dados: Partial<DadosInscricao>) => {
    setState(prev => ({
      ...prev,
      dadosInscricao: { ...prev.dadosInscricao, ...dados }
    }));
  }, []);

  const validarInscricaoCompleta = useCallback((): { valida: boolean; erros: string[] } => {
    const erros: string[] = [];
    
    if (!state.dadosInscricao.nome) erros.push('Nome é obrigatório');
    if (!state.dadosInscricao.documento) erros.push('Documento é obrigatório');
    if (!state.dadosInscricao.email) erros.push('Email é obrigatório');
    if (!state.dadosInscricao.celular) erros.push('Celular é obrigatório');
    if (!state.dadosInscricao.dataNascimento) erros.push('Data de nascimento é obrigatória');
    
    if (state.eventosSelecionados.length === 0) {
      erros.push('Selecione pelo menos uma modalidade');
    }
    
    return { valida: erros.length === 0, erros };
  }, [state.dadosInscricao, state.eventosSelecionados]);

  const irParaEtapa = useCallback((etapa: UseFestivalInscricoesState['etapaAtual']) => {
    if (etapa === 'formulario') {
      if (state.eventosSelecionados.length === 0) {
        setState(prev => ({ ...prev, erros: ['Selecione pelo menos uma modalidade'] }));
        return;
      }
    }
    
    if (etapa === 'pagamento') {
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

  const resetarInscricao = useCallback(() => {
    setState(prev => ({
      ...prev,
      eventosSelecionados: [],
      participantesPorEvento: {},
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

  const calculos = useMemo(() => {
    const eventosSelecionadosDetalhes = state.eventosSelecionados
      .map(id => state.todosEventos.find(e => e.id === id))
      .filter(Boolean) as FestivalEvent[];
    
    const precoTotal = eventosSelecionadosDetalhes.reduce((total, evento) => {
      const numeroParticipantes = state.participantesPorEvento[evento.id] || 1;
      return total + calcularPrecoInscricao(evento.modalidade, numeroParticipantes);
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
  }, [state.eventosSelecionados, state.todosEventos, state.participantesPorEvento]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      precoTotal: calculos.precoTotal,
      resumoInscricao: calculos.resumoInscricao
    }));
  }, [calculos]);

  const dadosAuxiliares = {
    estilosDisponiveis: Object.values(ESTILOS_DANCA),
    modalidadesDisponiveis: Object.values(MODALIDADES_PRECOS),
    categoriasDisponiveis: Object.values(CATEGORIAS_IDADE),
    eventosSelecionadosDetalhes: calculos.eventosSelecionadosDetalhes
  };

  return {
    ...state,
    
    atualizarFiltros,
    limparFiltros,
    atualizarBusca,
    toggleEventoSelecao,
    atualizarParticipantesEvento,
    atualizarDadosInscricao,
    irParaEtapa,
    resetarInscricao,
    validarInscricaoCompleta,
    
    ...dadosAuxiliares,
    
    filtrarEventos: (filtros: FiltrosEventos) => filtrarEventos(state.todosEventos, filtros),
    calcularPrecoInscricao,
    validarInscricao
  };
};