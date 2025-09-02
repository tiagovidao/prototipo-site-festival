import { useFestivalInscricoes } from '../hooks/useFestivalInscricoes';
import { useState, useMemo, useEffect } from 'react';
import SelecaoEventos from './inscricoes/SelecaoEventos';
import FormularioDados from './inscricoes/FormularioDados';
import Pagamento from './inscricoes/Pagamento';
import { type DadosInscricao } from '../types/festival';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

interface Participante {
  nome: string;
}

const FestivalInscricaoForm = () => {
  const {
    todosEventos,
    eventosSelecionados,
    participantesPorEvento,
    dadosInscricao,
    erros,
    precoTotal,
    resumoInscricao,
    eventosSelecionadosDetalhes,
    estilosDisponiveis,
    toggleEventoSelecao,
    atualizarParticipantesEvento,
    atualizarDadosInscricao,
    irParaEtapa,
    resetarInscricao,
  } = useFestivalInscricoes();

  const navigate = useNavigate();
  const location = useLocation();

  const [participantes, setParticipantes] = useState<Participante[]>([{ nome: '' }]);

  // Verifica se tem modalidade conjunto selecionada
  const hasConjunto = useMemo(() => {
    return eventosSelecionadosDetalhes.some(evento => evento.modalidade === 'Conjunto');
  }, [eventosSelecionadosDetalhes]);

  // Atualiza número de participantes baseado na modalidade
  useEffect(() => {
    if (eventosSelecionadosDetalhes.length > 0) {
      const modalidades = eventosSelecionadosDetalhes.map(e => e.modalidade);
      
      let numParticipantes = 1;
      
      if (modalidades.includes('Conjunto')) {
        const eventoConjunto = eventosSelecionadosDetalhes.find(e => e.modalidade === 'Conjunto');
        if (eventoConjunto) {
          numParticipantes = participantesPorEvento[eventoConjunto.id] || 4;
        }
      } else if (modalidades.includes('Trio')) {
        numParticipantes = 3;
      } else if (modalidades.some(m => ['Duo', 'Pas de Deux', 'Grand Pas de Deux'].includes(m))) {
        numParticipantes = 2;
      }
      
      setParticipantes(prev => 
        Array.from({ length: numParticipantes }, (_, i) => 
          i < prev.length ? prev[i] : { nome: '' }
        ).slice(0, numParticipantes)
      );
    }
  }, [eventosSelecionadosDetalhes, participantesPorEvento]);

  // Sincroniza rota com etapa
  useEffect(() => {
    if (location.pathname.endsWith('/formulario/pagamento')) {
      irParaEtapa('pagamento');
    } else if (location.pathname.endsWith('/formulario')) {
      irParaEtapa('formulario');
    } else {
      irParaEtapa('selecao');
    }
  }, [location.pathname]);

  const goToEtapa = (etapa: string) => {
    irParaEtapa(etapa);
    if (etapa === 'selecao') {
      navigate('/inscricoes', { replace: false });
    } else if (etapa === 'formulario') {
      navigate('/inscricoes/formulario', { replace: false });
    } else if (etapa === 'pagamento') {
      navigate('/inscricoes/formulario/pagamento', { replace: false });
    } else {
      navigate('/inscricoes', { replace: false });
    }
  };

  const handleParticipanteChange = (index: number, value: string) => {
    const novosParticipantes = [...participantes];
    novosParticipantes[index].nome = value;
    setParticipantes(novosParticipantes);
    
    atualizarDadosInscricao({ 
      ...dadosInscricao, 
      participantes: novosParticipantes 
    } as Partial<DadosInscricao & { participantes?: Participante[] }>);
  };

  const adicionarParticipante = () => {
    if (participantes.length < 20) {
      setParticipantes([...participantes, { nome: '' }]);
    }
  };

  const removerParticipante = (index: number) => {
    if (participantes.length > 1) {
      const novosParticipantes = [...participantes];
      novosParticipantes.splice(index, 1);
      setParticipantes(novosParticipantes);
      atualizarDadosInscricao({ 
        ...dadosInscricao, 
        participantes: novosParticipantes 
      } as Partial<DadosInscricao & { participantes?: Participante[] }>);
    }
  };

  const handleResetInscricao = () => {
    resetarInscricao();
    navigate('/inscricoes');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Routes>
          <Route
            path="/"
            element={
              <SelecaoEventos
                eventosDisponiveis={todosEventos}
                eventosSelecionados={eventosSelecionados}
                participantesPorEvento={participantesPorEvento}
                erros={erros}
                precoTotal={precoTotal}
                resumoInscricao={resumoInscricao}
                eventosSelecionadosDetalhes={eventosSelecionadosDetalhes}
                estilosDisponiveis={estilosDisponiveis}
                toggleEventoSelecao={toggleEventoSelecao}
                atualizarParticipantesEvento={atualizarParticipantesEvento}
                irParaEtapa={goToEtapa}
              />
            }
          />

          <Route
            path="formulario"
            element={
              <FormularioDados
                eventosSelecionadosDetalhes={eventosSelecionadosDetalhes}
                participantesPorEvento={participantesPorEvento}
                precoTotal={precoTotal}
                dadosInscricao={dadosInscricao as DadosInscricao & { participantes?: Participante[] }}
                participantes={participantes}
                hasConjunto={hasConjunto}
                erros={erros}
                atualizarDadosInscricao={atualizarDadosInscricao}
                irParaEtapa={goToEtapa}
                handleParticipanteChange={handleParticipanteChange}
                adicionarParticipante={adicionarParticipante}
                removerParticipante={removerParticipante}
              />
            }
          />

          <Route
            path="formulario/pagamento"
            element={
              <Pagamento
                precoTotal={precoTotal}
                irParaEtapa={goToEtapa}
                resetarInscricao={handleResetInscricao}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default FestivalInscricaoForm;