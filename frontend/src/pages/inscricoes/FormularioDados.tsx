import { User, Mail, Phone, Calendar, FileText, Plus, Minus } from 'lucide-react';

interface FestivalEvent {
  id: string;
  titulo: string;
  modalidade: string;
  preco: number;
}

interface DadosInscricao {
  nome: string;
  documento: string;
  email: string;
  celular: string;
  dataNascimento: string;
  escola?: string;
  coreografo?: string;
  observacoes?: string;
  participantes?: Participante[];
}

interface Participante {
  nome: string;
}

interface FormularioDadosProps {
  eventosSelecionadosDetalhes: FestivalEvent[];
  precoTotal: number;
  dadosInscricao: DadosInscricao;
  participantes: Participante[];
  hasConjunto: boolean;
  erros: string[];
  atualizarDadosInscricao: (dados: Partial<DadosInscricao>) => void;
  irParaEtapa: (etapa: string) => void;
  handleParticipanteChange: (index: number, value: string) => void;
  adicionarParticipante: () => void;
  removerParticipante: (index: number) => void;
}

const FormularioDados = ({
  eventosSelecionadosDetalhes,
  precoTotal,
  dadosInscricao,
  participantes,
  hasConjunto,
  erros,
  atualizarDadosInscricao,
  irParaEtapa,
  handleParticipanteChange,
  adicionarParticipante,
  removerParticipante,
}: FormularioDadosProps) => {
  /**
   * Formata uma string como CPF: 000.000.000-00
   */
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  /**
   * Formata número de telefone brasileiro:
   * - (DD) NNNN-NNNN  para 10 dígitos
   * - (DD) NNNNN-NNNN para 11 dígitos (celular com 9)
   */
  const formatPhoneBR = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const len = digits.length;

    if (len === 0) return '';
    if (len <= 2) return `(${digits}`;
    if (len <= 6) {
      const ddd = digits.slice(0, 2);
      const rest = digits.slice(2);
      return `(${ddd}) ${rest}`;
    }
    if (len <= 10) {
      const ddd = digits.slice(0, 2);
      const part1 = digits.slice(2, 6);
      const part2 = digits.slice(6);
      return `(${ddd}) ${part1}-${part2}`;
    }
    // len === 11
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 7);
    const part2 = digits.slice(7);
    return `(${ddd}) ${part1}-${part2}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-purple-900">Dados do Participante</h2>
        <button
          onClick={() => irParaEtapa('selecao')}
          className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          ← Voltar
        </button>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-semibold mb-2">Modalidades Selecionadas:</h3>
        <div className="space-y-2">
          {eventosSelecionadosDetalhes.map((evento) => (
            <div key={evento.id} className="flex justify-between items-center text-sm">
              <span>{evento.titulo}</span>
              <span className="font-semibold">R$ {evento.preco.toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>Total:</span>
          <span>R$ {precoTotal.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border-purple-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={dadosInscricao.nome}
                onChange={(e) => atualizarDadosInscricao({ nome: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento (CPF) *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={dadosInscricao.documento || ''}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  atualizarDadosInscricao({ documento: formatted });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={dadosInscricao.email}
                onChange={(e) => atualizarDadosInscricao({ email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Celular *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={dadosInscricao.celular || ''}
                onChange={(e) => {
                  const formatted = formatPhoneBR(e.target.value);
                  atualizarDadosInscricao({ celular: formatted });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="(61) 9XXXX-XXXX"
                inputMode="tel"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dadosInscricao.dataNascimento}
                onChange={(e) => atualizarDadosInscricao({ dataNascimento: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escola/Grupo (opcional)
            </label>
            <input
              type="text"
              value={dadosInscricao.escola || ''}
              onChange={(e) => atualizarDadosInscricao({ escola: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nome da escola ou grupo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coreógrafo (opcional)
            </label>
            <input
              type="text"
              value={dadosInscricao.coreografo || ''}
              onChange={(e) => atualizarDadosInscricao({ coreografo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nome do coreógrafo"
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Participantes</h3>
          
          {participantes.map((participante, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {hasConjunto ? `Integrante ${index + 1} *` : 
                 index === 0 ? 'Nome do Participante *' : 
                 index === 1 ? 'Nome do Participante 2 *' : 
                 `Nome do Participante ${index + 1} *`}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={participante.nome}
                  onChange={(e) => handleParticipanteChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={hasConjunto ? `Nome do integrante ${index + 1}` : 
                              `Nome do participante ${index + 1}`}
                />
                {hasConjunto && index >= 4 && (
                  <button
                    type="button"
                    onClick={() => removerParticipante(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {hasConjunto && (
            <button
              type="button"
              onClick={adicionarParticipante}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Integrante (R$ 45,00 cada)
            </button>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <textarea
            value={dadosInscricao.observacoes || ''}
            onChange={(e) => atualizarDadosInscricao({ observacoes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Informações adicionais sobre sua participação..."
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => irParaEtapa('selecao')}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={() => irParaEtapa('pagamento')}
          className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          Ir para Pagamento
        </button>
      </div>

      {erros.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Corrija os seguintes erros:</h4>
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

export default FormularioDados;
