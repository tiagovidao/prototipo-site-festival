import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  EVENTOS_FESTIVAL, 
  calcularPrecoInscricao,
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

interface ParticipantesPorEvento {
  [eventoId: string]: number;
}

interface UseFestivalInscricoesState {
  todosEventos: FestivalEvent[];
  eventosSelecionados: string[];
  participantesPorEvento: ParticipantesPorEvento;
  
  dadosInscricao: DadosInscricao;
  
  etapaAtual: string;
  carregando: boolean;
  erros: string[];
  
  precoTotal: number;
  resumoInscricao: {
    tituloEvento: string;
  };
}

export const useFestivalInscricoes = () => {
  const [state, setState] = useState<UseFestivalInscricoesState>({
    todosEventos: EVENTOS_FESTIVAL,
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
    carregando: false,
    erros: [],
    precoTotal: 0,
    resumoInscricao: {
      tituloEvento: ''
    }
  });

  const toggleEventoSelecao = useCallback((eventoId: string) => {
    setState(prev => {
      const jaSelecionado = prev.eventosSelecionados.includes(eventoId);
      const evento = prev.todosEventos.find(e => e.id === eventoId);
      
      if (jaSelecionado) {
        // Remove evento da seleção
        const novosParticipantes = { ...prev.participantesPorEvento };
        delete novosParticipantes[eventoId];
        
        return {
          ...prev,
          eventosSelecionados: [],
          participantesPorEvento: novosParticipantes
        };
      } else {
        // Seleciona apenas um evento por vez
        const numeroInicial = evento?.modalidade === 'Conjunto' ? 4 : 1;
        
        return {
          ...prev,
          eventosSelecionados: [eventoId],
          participantesPorEvento: {
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
      erros.push('Selecione uma modalidade');
    }
    
    return { valida: erros.length === 0, erros };
  }, [state.dadosInscricao, state.eventosSelecionados]);

  const irParaEtapa = useCallback((etapa: UseFestivalInscricoesState['etapaAtual']) => {
    if (etapa === 'formulario') {
      if (state.eventosSelecionados.length === 0) {
        setState(prev => ({ ...prev, erros: ['Selecione uma modalidade'] }));
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
      erros: []
    }));
  }, []);

  // Calcula preço total e resumo baseado na seleção atual
  const calculos = useMemo(() => {
    const eventosSelecionadosDetalhes = state.eventosSelecionados
      .map(id => state.todosEventos.find(e => e.id === id))
      .filter(Boolean) as FestivalEvent[];
    
    const precoTotal = eventosSelecionadosDetalhes.reduce((total, evento) => {
      const numeroParticipantes = state.participantesPorEvento[evento.id] || 1;
      return total + calcularPrecoInscricao(evento.modalidade, numeroParticipantes);
    }, 0);
    
    const tituloEvento = eventosSelecionadosDetalhes.length > 0 
      ? eventosSelecionadosDetalhes[0].titulo 
      : '';
    
    return {
      precoTotal,
      resumoInscricao: {
        tituloEvento
      },
      eventosSelecionadosDetalhes
    };
  }, [state.eventosSelecionados, state.todosEventos, state.participantesPorEvento]);

  // Atualiza estado com cálculos quando seleção muda
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
    
    toggleEventoSelecao,
    atualizarParticipantesEvento,
    atualizarDadosInscricao,
    irParaEtapa,
    resetarInscricao,
    validarInscricaoCompleta,
    
    ...dadosAuxiliares,
    
    calcularPrecoInscricao
  };
};