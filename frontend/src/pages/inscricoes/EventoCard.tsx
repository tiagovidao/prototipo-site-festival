import { Users, Clock, Trophy, DollarSign, Plus, Minus } from 'lucide-react';

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

interface EventoCardProps {
  evento: Evento;
  selecionado: boolean;
  onToggle: () => void;
  numeroParticipantes?: number;
  onParticipantesChange?: (numero: number) => void;
}

const EventoCard = ({ 
  evento, 
  selecionado, 
  onToggle, 
  numeroParticipantes = 1, 
  onParticipantesChange 
}: EventoCardProps) => {
  const isConjunto = evento.modalidade === 'Conjunto';
  const precoTotal = isConjunto ? evento.preco * numeroParticipantes : evento.preco;
  const minParticipantes = isConjunto ? 4 : 1;

  const handleParticipantesChange = (delta: number) => {
    const novoNumero = Math.max(minParticipantes, numeroParticipantes + delta);
    if (novoNumero <= 20) {
      onParticipantesChange?.(novoNumero);
    }
  };

  return (
    <div
      className={`p-4 border rounded-xl transition-all ${
        selecionado
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className={`flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer ${
                selecionado ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
              }`}
              onClick={onToggle}
            >
              {selecionado && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {evento.titulo}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {evento.modalidade}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {evento.tempoLimite}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              {evento.categoria}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {isConjunto ? (
                <span>
                  R$ {evento.preco.toFixed(2).replace('.', ',')} / pessoa
                </span>
              ) : (
                <span>R$ {evento.preco.toFixed(2).replace('.', ',')}</span>
              )}
            </div>
          </div>

          {/* Controle de participantes para modalidade Conjunto */}
          {isConjunto && selecionado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Participantes (mín. {minParticipantes})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleParticipantesChange(-1)}
                    disabled={numeroParticipantes <= minParticipantes}
                    className="w-6 h-6 rounded-full border border-blue-300 flex items-center justify-center hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-semibold text-blue-800">
                    {numeroParticipantes}
                  </span>
                  <button
                    onClick={() => handleParticipantesChange(1)}
                    disabled={numeroParticipantes >= 20}
                    className="w-6 h-6 rounded-full border border-blue-300 flex items-center justify-center hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-blue-600">Total: </span>
                <span className="font-semibold text-blue-800">
                  R$ {precoTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{evento.descricao}</p>
        </div>
      </div>
    </div>
  );
};

export default EventoCard;