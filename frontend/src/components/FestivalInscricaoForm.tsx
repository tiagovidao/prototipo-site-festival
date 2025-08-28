import { useFestivalInscricoes } from '../hooks/useFestivalInscricoes';
import { useState, useMemo, useEffect } from 'react';
import SelecaoEventos from './inscricoes/SelecaoEventos';
import FormularioDados from './inscricoes/FormularioDados';
import Pagamento from './inscricoes/Pagamento';
import { type DadosInscricao } from '../types/festival';

interface Participante {
  nome: string;
}

const FestivalInscricaoForm = () => {
  const {
    eventosDisponiveis,
    eventosSelecionados,
    dadosInscricao,
    filtros,
    textoBusca,
    etapaAtual,
    erros,
    precoTotal,
    resumoInscricao,
    eventosSelecionadosDetalhes,
    estilosDisponiveis,
    modalidadesDisponiveis,
    categoriasDisponiveis,
    atualizarFiltros,
    limparFiltros,
    atualizarBusca,
    toggleEventoSelecao,
    atualizarDadosInscricao,
    irParaEtapa,
    resetarInscricao,
  } = useFestivalInscricoes();

  const [participantes, setParticipantes] = useState<Participante[]>([{ nome: '' }]);

  const hasConjunto = useMemo(() => {
    return eventosSelecionadosDetalhes.some(evento => evento.modalidade === 'Conjunto');
  }, [eventosSelecionadosDetalhes]);

  useEffect(() => {
    if (eventosSelecionadosDetalhes.length > 0) {
      const modalidades = eventosSelecionadosDetalhes.map(e => e.modalidade);
      
      let numParticipantes = 1;
      
      if (modalidades.includes('Conjunto')) {
        numParticipantes = 4;
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
  }, [eventosSelecionadosDetalhes]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {etapaAtual === 'selecao' && (
          <SelecaoEventos
            eventosDisponiveis={eventosDisponiveis}
            eventosSelecionados={eventosSelecionados}
            filtros={filtros}
            textoBusca={textoBusca}
            erros={erros}
            precoTotal={precoTotal}
            resumoInscricao={resumoInscricao}
            eventosSelecionadosDetalhes={eventosSelecionadosDetalhes}
            estilosDisponiveis={estilosDisponiveis}
            modalidadesDisponiveis={modalidadesDisponiveis}
            categoriasDisponiveis={categoriasDisponiveis}
            atualizarFiltros={atualizarFiltros}
            limparFiltros={limparFiltros}
            atualizarBusca={atualizarBusca}
            toggleEventoSelecao={toggleEventoSelecao}
            irParaEtapa={irParaEtapa}
          />
        )}
        {etapaAtual === 'formulario' && (
          <FormularioDados
            eventosSelecionadosDetalhes={eventosSelecionadosDetalhes}
            precoTotal={precoTotal}
            dadosInscricao={dadosInscricao as DadosInscricao & { participantes?: Participante[] }}
            participantes={participantes}
            hasConjunto={hasConjunto}
            erros={erros}
            atualizarDadosInscricao={atualizarDadosInscricao}
            irParaEtapa={irParaEtapa}
            handleParticipanteChange={handleParticipanteChange}
            adicionarParticipante={adicionarParticipante}
            removerParticipante={removerParticipante}
          />
        )}
        {etapaAtual === 'pagamento' && (
          <Pagamento
            precoTotal={precoTotal}
            irParaEtapa={irParaEtapa}
            resetarInscricao={resetarInscricao}
          />
        )}
      </div>
    </div>
  );
};

export default FestivalInscricaoForm;