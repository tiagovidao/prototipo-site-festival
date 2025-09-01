import { Filter, X, ChevronUp, ChevronDown, Calendar, MapPin } from 'lucide-react';
import { useState, useMemo } from 'react';
import EventoCard from './EventoCard';
import Filtros from './Filtros';
import MenuCategorias from './MenuCategorias';

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

interface Modalidade {
  nome: string;
  preco: number;
}

interface Categoria {
  codigo: string;
  nome: string;
  idadeMin: number;
  idadeMax: number;
}

interface ResumoInscricao {
  quantidadeEventos: number;
  estilosUnicos: string[];
}

interface ParticipantesPorEvento {
  [eventoId: string]: number;
}

interface FiltrosEvento {
  modalidade?: string;
  categoria?: string;
  idadeMin?: number;
  idadeMax?: number;
  precoMin?: number;
  precoMax?: number;
  disponivel?: boolean;
}

interface SelecaoEventosProps {
  eventosDisponiveis: Evento[];
  eventosSelecionados: string[];
  participantesPorEvento: ParticipantesPorEvento;
  filtros: FiltrosEvento;
  textoBusca: string;
  erros: string[];
  precoTotal: number;
  resumoInscricao: ResumoInscricao;
  eventosSelecionadosDetalhes: Evento[];
  estilosDisponiveis: Estilo[];
  modalidadesDisponiveis: Modalidade[];
  categoriasDisponiveis: Categoria[];
  atualizarFiltros: (filtros: Partial<FiltrosEvento>) => void;
  limparFiltros: () => void;
  atualizarBusca: (texto: string) => void;
  toggleEventoSelecao: (eventoId: string) => void;
  atualizarParticipantesEvento: (eventoId: string, numero: number) => void;
  irParaEtapa: (etapa: string) => void;
}

const SelecaoEventos = ({
  eventosDisponiveis,
  eventosSelecionados,
  participantesPorEvento,
  filtros,
  textoBusca,
  erros,
  precoTotal,
  resumoInscricao,
  estilosDisponiveis,
  modalidadesDisponiveis,
  categoriasDisponiveis,
  atualizarFiltros,
  limparFiltros,
  atualizarBusca,
  toggleEventoSelecao,
  atualizarParticipantesEvento,
  irParaEtapa,
}: SelecaoEventosProps) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODOS');
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<string, boolean>>({});
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [menuCategoriasMobileAberto, setMenuCategoriasMobileAberto] = useState(false);

  const eventosPorEstilo = useMemo(() => {
    const agrupados: Record<string, Evento[]> = {};
    
    estilosDisponiveis.forEach(estilo => {
      agrupados[estilo.nome] = eventosDisponiveis.filter(evento => 
        evento.estilo === estilo.nome
      );
    });
    
    return agrupados;
  }, [eventosDisponiveis, estilosDisponiveis]);

  const selecionarEventoUnico = (eventoId: string) => {
    if (eventosSelecionados.includes(eventoId)) {
      toggleEventoSelecao(eventoId);
    } else {
      eventosSelecionados.forEach(id => toggleEventoSelecao(id));
      toggleEventoSelecao(eventoId);
    }
  };

  const toggleExpandirCategoria = (categoria: string) => {
    setCategoriasExpandidas(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  const toggleFiltros = () => {
    setFiltrosAbertos(!filtrosAbertos);
  };

  const renderEventoCard = (evento: Evento) => (
    <EventoCard 
      key={evento.id} 
      evento={evento} 
      selecionado={eventosSelecionados.includes(evento.id)}
      onToggle={() => selecionarEventoUnico(evento.id)}
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
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>Atenção:</strong> Selecione as modalidades conforme sua categoria de idade. 
            Para modalidade "Conjunto", o valor é por participante com mínimo de 4 pessoas.
          </p>
        </div>
      </div>

      <Filtros
        filtros={filtros}
        textoBusca={textoBusca}
        filtrosAbertos={filtrosAbertos}
        modalidadesDisponiveis={modalidadesDisponiveis}
        categoriasDisponiveis={categoriasDisponiveis}
        atualizarFiltros={atualizarFiltros}
        atualizarBusca={atualizarBusca}
        limparFiltros={limparFiltros}
        toggleFiltros={toggleFiltros}
      />

      <MenuCategorias
        categoriaAtiva={categoriaAtiva}
        setCategoriaAtiva={setCategoriaAtiva}
        estilosDisponiveis={estilosDisponiveis}
        eventosPorEstilo={eventosPorEstilo}
        eventosDisponiveis={eventosDisponiveis}
        menuCategoriasMobileAberto={menuCategoriasMobileAberto}
        setMenuCategoriasMobileAberto={setMenuCategoriasMobileAberto}
        limparFiltros={limparFiltros}
      />

      <div className="space-y-4">
        {categoriaAtiva === 'TODOS' ? (
          Object.entries(eventosPorEstilo).map(([estilo, eventos]) => 
            eventos.length > 0 ? (
              <div key={estilo} className="bg-white rounded-xl shadow-sm border overflow-hidden border-purple-200">
                <button
                  className="w-full p-4 flex justify-between items-center bg-purple-50 hover:bg-purple-100 transition-colors"
                  onClick={() => toggleExpandirCategoria(estilo)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-purple-900">{estilo}</h3>
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {eventos.length} modalidade{eventos.length !== 1 ? 's' : ''}
                    </span>
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
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventosPorEstilo[categoriaAtiva]?.map(renderEventoCard)}
          </div>
        )}
        
        {eventosDisponiveis.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma modalidade encontrada com os filtros aplicados.</p>
            <button
              onClick={limparFiltros}
              className="mt-2 text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1 mx-auto"
            >
              <X className="w-4 h-4" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {eventosSelecionados.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-xl sticky bottom-4 shadow-lg border border-purple-200 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-3 text-center">Resumo da Seleção</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {resumoInscricao.quantidadeEventos}
              </div>
              <div className="text-xs text-gray-600">Modalidades</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {resumoInscricao.estilosUnicos.length}
              </div>
              <div className="text-xs text-gray-600">Estilos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                R$ {precoTotal.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
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