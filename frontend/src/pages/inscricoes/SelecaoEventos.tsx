import { ChevronDown, Calendar, MapPin, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import EventoCard from './EventoCard';

interface Evento {
  id: string;
  titulo: string;
  modalidade: string;
  tempoLimite: string;
  categoria: string;
  preco: number;
  descricao: string;
  observacoes?: string[];
  estilo: string;
}

interface Estilo {
  nome: string;
}

interface ResumoInscricao {
  tituloEvento: string;
}

interface ParticipantesPorEvento {
  [eventoId: string]: number;
}

interface SelecaoEventosProps {
  eventosDisponiveis: Evento[];
  eventosSelecionados: string[];
  participantesPorEvento: ParticipantesPorEvento;
  erros: string[];
  precoTotal: number;
  resumoInscricao: ResumoInscricao;
  eventosSelecionadosDetalhes: Evento[];
  estilosDisponiveis: Estilo[];
  toggleEventoSelecao: (eventoId: string) => void;
  atualizarParticipantesEvento: (eventoId: string, numero: number) => void;
  irParaEtapa: (etapa: string) => void;
}

const SelecaoEventos = ({
  eventosDisponiveis,
  eventosSelecionados,
  participantesPorEvento,
  erros,
  precoTotal,
  resumoInscricao,
  estilosDisponiveis,
  toggleEventoSelecao,
  atualizarParticipantesEvento,
  irParaEtapa,
}: SelecaoEventosProps) => {
  const [estiloSelecionado, setEstiloSelecionado] = useState<string>('');
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState<string>('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [mostrarTodosEventos, setMostrarTodosEventos] = useState(false);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<string, boolean>>({});

  const modalidadesDisponiveis = useMemo(() => {
    if (!estiloSelecionado) return [];

    const eventosDoEstilo = eventosDisponiveis.filter(e => e.estilo === estiloSelecionado);
    const modalidades = [...new Set(eventosDoEstilo.map(e => e.modalidade))];
    return modalidades;
  }, [estiloSelecionado, eventosDisponiveis]);

  const categoriasDisponiveis = useMemo(() => {
    if (!estiloSelecionado || !modalidadeSelecionada) return [];

    const eventosFiltrados = eventosDisponiveis.filter(e =>
      e.estilo === estiloSelecionado && e.modalidade === modalidadeSelecionada
    );
    const categorias = [...new Set(eventosFiltrados.map(e => e.categoria))];
    return categorias;
  }, [estiloSelecionado, modalidadeSelecionada, eventosDisponiveis]);

  const eventoEspecifico = useMemo(() => {
    if (!estiloSelecionado || !modalidadeSelecionada || !categoriaSelecionada) return null;

    return eventosDisponiveis.find(e =>
      e.estilo === estiloSelecionado &&
      e.modalidade === modalidadeSelecionada &&
      e.categoria === categoriaSelecionada
    );
  }, [estiloSelecionado, modalidadeSelecionada, categoriaSelecionada, eventosDisponiveis]);

  const eventosPorEstilo = useMemo(() => {
    const agrupados: Record<string, Evento[]> = {};

    estilosDisponiveis.forEach(estilo => {
      agrupados[estilo.nome] = eventosDisponiveis.filter(evento =>
        evento.estilo === estilo.nome
      );
    });

    return agrupados;
  }, [eventosDisponiveis, estilosDisponiveis]);

  const handleEstiloChange = (estilo: string) => {
    setEstiloSelecionado(estilo);
    setModalidadeSelecionada('');
    setCategoriaSelecionada('');
  };

  const handleModalidadeChange = (modalidade: string) => {
    setModalidadeSelecionada(modalidade);
    setCategoriaSelecionada('');
  };

  const toggleExpandirCategoria = (categoria: string) => {
    setCategoriasExpandidas(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    onChange: (value: string) => void,
    disabled = false
  ) => (
    <div className="relative">
      <label className="block text-sm font-medium text-purple-800 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-white border border-purple-200 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 appearance-none cursor-pointer"
        >
          <option value="">Selecione...</option>
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600 pointer-events-none" />
      </div>
    </div>
  );

  const renderEventoCard = (evento: Evento) => (
    <EventoCard
      key={evento.id}
      evento={evento}
      selecionado={eventosSelecionados.includes(evento.id)}
      onToggle={() => toggleEventoSelecao(evento.id)}
      numeroParticipantes={participantesPorEvento[evento.id] || (evento.modalidade === 'Conjunto' ? 4 : 1)}
      onParticipantesChange={(numero) => atualizarParticipantesEvento(evento.id, numero)}
    />
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">
          2º Festival Internacional de Dança de Brasília
        </h1>
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>16 a 18 de Outubro de 2025</span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>Teatro Nacional Cláudio Santoro</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">Escolha sua Modalidade</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {renderDropdown(
            "1. Estilo de Dança",
            estiloSelecionado,
            estilosDisponiveis.map(e => e.nome),
            handleEstiloChange
          )}

          {renderDropdown(
            "2. Modalidade",
            modalidadeSelecionada,
            modalidadesDisponiveis,
            handleModalidadeChange,
            !estiloSelecionado
          )}

          {renderDropdown(
            "3. Categoria Etária",
            categoriaSelecionada,
            categoriasDisponiveis,
            setCategoriaSelecionada,
            !modalidadeSelecionada
          )}
        </div>

        {eventoEspecifico && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Modalidade Encontrada:</h3>
            {renderEventoCard(eventoEspecifico)}
          </div>
        )}

        {(!estiloSelecionado || !modalidadeSelecionada || !categoriaSelecionada) && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-700">
              Complete a seleção acima para ver a modalidade disponível
            </p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={() => setMostrarTodosEventos(!mostrarTodosEventos)}
          className="inline-flex items-center gap-2 px-4 py-2 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
        >
          {mostrarTodosEventos ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar Todas as Modalidades
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver Todas as Modalidades
            </>
          )}
        </button>
      </div>

      {mostrarTodosEventos && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Visualização completa:</strong> Todos os estilos e modalidades disponíveis.
              Use os dropdowns acima para uma seleção mais rápida.
            </p>
          </div>

          {Object.entries(eventosPorEstilo).map(([estilo, eventos]) =>
            eventos.length > 0 ? (
              <div key={estilo} className="bg-white rounded-xl shadow-sm border overflow-hidden border-purple-200">
                <button
                  className="w-full p-4 flex justify-between items-center bg-purple-50 hover:bg-purple-100 transition-colors"
                  onClick={() => toggleExpandirCategoria(estilo)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-purple-900">{estilo}</h3>
                  </div>
                  {categoriasExpandidas[estilo] ? (
                    <ChevronUp className="text-purple-600" />
                  ) : (
                    <ChevronDown className="text-purple-600" />
                  )}
                </button>

                {categoriasExpandidas[estilo] && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventos.map(renderEventoCard)}
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>
      )}

      {eventosSelecionados.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-xl sticky bottom-4 shadow-lg border border-purple-200 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-3 text-center">Modalidade Selecionada</h3>

          <div className="text-center mb-3">
            <div className="text-sm text-purple-700 font-medium mb-1">
              {resumoInscricao.tituloEvento}
            </div>
            <div className="text-2xl font-bold text-green-600">
              R$ {precoTotal.toFixed(2).replace('.', ',')}
            </div>
          </div>

          <button
            onClick={() => toggleEventoSelecao(eventosSelecionados[0])}
            className="w-full bg-white text-purple-600 border border-purple-600 py-2 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm mb-2"
          >
            Remover Modalidade 
          </button>

          <button
            onClick={() => irParaEtapa('formulario')}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
          >
            Continuar para Dados Pessoais
          </button>
        </div>
      )}


      {erros.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Atenção:</h4>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {erros.map((erro, index) => (
              <li key={index}>{erro}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelecaoEventos;