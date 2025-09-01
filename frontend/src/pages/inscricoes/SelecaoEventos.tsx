import { ChevronUp, ChevronDown, Calendar, MapPin } from 'lucide-react';
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
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<string, boolean>>({});

  // Agrupa eventos por estilo
  const eventosPorEstilo = useMemo(() => {
    const agrupados: Record<string, Evento[]> = {};
    
    estilosDisponiveis.forEach(estilo => {
      agrupados[estilo.nome] = eventosDisponiveis.filter(evento => 
        evento.estilo === estilo.nome
      );
    });
    
    return agrupados;
  }, [eventosDisponiveis, estilosDisponiveis]);

  const toggleExpandirCategoria = (categoria: string) => {
    setCategoriasExpandidas(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

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
      {/* Header do Festival */}
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
            <strong>Atenção:</strong> Selecione UMA modalidade conforme sua categoria de idade. 
            Para modalidade "Conjunto", o valor é por participante com mínimo de 4 pessoas.
          </p>
        </div>
      </div>

      {/* Lista de Eventos por Estilo */}
      <div className="space-y-4">
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
        
        {eventosDisponiveis.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma modalidade encontrada.</p>
          </div>
        )}
      </div>

      {/* Resumo da Seleção - apenas quando algo for selecionado */}
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
            onClick={() => irParaEtapa('formulario')}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
          >
            Continuar para Dados Pessoais
          </button>
        </div>
      )}

      {/* Mensagens de Erro */}
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