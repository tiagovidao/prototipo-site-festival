import { Users, Clock, Trophy, DollarSign } from 'lucide-react';

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
}

const EventoCard = ({ evento, selecionado, onToggle }: EventoCardProps) => (
  <div
    className={`p-4 border rounded-xl cursor-pointer transition-all ${
      selecionado
        ? 'border-purple-500 bg-purple-50 shadow-md'
        : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-sm'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${selecionado ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
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
            R$ {evento.preco.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{evento.descricao}</p>
        
        {evento.observacoes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
            <p className="text-xs text-yellow-800">
              <strong>Observação:</strong> {evento.observacoes.join('; ')}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default EventoCard;