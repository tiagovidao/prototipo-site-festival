import { User, Mail, Phone, Calendar, FileText, Plus, Minus } from 'lucide-react';
import { calcularPrecoInscricao, type FestivalEvent } from '../../config/festivalEventsConfig';
import { useState } from 'react';

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

interface ParticipantesPorEvento {
  [eventoId: string]: number;
}

interface FormularioDadosProps {
  eventosSelecionadosDetalhes: FestivalEvent[];
  participantesPorEvento: ParticipantesPorEvento;
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
  participantesPorEvento,
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
  const [camposTocados, setCamposTocados] = useState<Record<string, boolean>>({});

  const marcarCampoTocado = (campo: string) => {
    setCamposTocados(prev => ({ ...prev, [campo]: true }));
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

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
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 7);
    const part2 = digits.slice(7);
    return `(${ddd}) ${part1}-${part2}`;
  };

  const isResponsavel = () => {
    return eventosSelecionadosDetalhes.some(evento => 
      evento.categoria.includes('PRÉ') || evento.categoria.includes('JÚNIOR')
    );
  };

  const validarCPF = (cpf: string): boolean => {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  };

  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validarCelular = (celular: string): boolean => {
    const apenasNumeros = celular.replace(/\D/g, '');
    return apenasNumeros.length >= 10;
  };

  const validarFormulario = (): { valido: boolean; erros: string[] } => {
    const erros: string[] = [];

    if (!dadosInscricao.nome.trim()) {
      erros.push('Nome é obrigatório');
    }

    if (!dadosInscricao.documento || !validarCPF(dadosInscricao.documento)) {
      erros.push('CPF é obrigatório e deve ser válido');
    }

    if (!dadosInscricao.email || !validarEmail(dadosInscricao.email)) {
      erros.push('Email é obrigatório e deve ser válido');
    }

    if (!dadosInscricao.celular || !validarCelular(dadosInscricao.celular)) {
      erros.push('Celular é obrigatório e deve ser válido');
    }

    if (!dadosInscricao.dataNascimento) {
      erros.push('Data de nascimento é obrigatória');
    }

    const participantesVazios = participantes.filter(p => !p.nome.trim());
    if (participantesVazios.length > 0) {
      erros.push(`${participantesVazios.length} nome(s) de participante(s) não preenchido(s)`);
    }

    return { valido: erros.length === 0, erros };
  };

  const irParaPagamento = () => {
    setCamposTocados({
      nome: true,
      documento: true,
      email: true,
      celular: true,
      dataNascimento: true,
      ...participantes.reduce((acc, _, index) => ({ ...acc, [`participante_${index}`]: true }), {})
    });

    const validacao = validarFormulario();
    if (!validacao.valido) {
      alert('Por favor, corrija os seguintes erros:\n\n' + validacao.erros.join('\n'));
      return;
    }
    irParaEtapa('pagamento');
  };

  const temErro = (campo: string): boolean => {
    if (!camposTocados[campo]) return false;
    
    switch (campo) {
      case 'nome':
        return !dadosInscricao.nome.trim();
      case 'documento':
        return !dadosInscricao.documento || !validarCPF(dadosInscricao.documento);
      case 'email':
        return !dadosInscricao.email || !validarEmail(dadosInscricao.email);
      case 'celular':
        return !dadosInscricao.celular || !validarCelular(dadosInscricao.celular);
      case 'dataNascimento':
        return !dadosInscricao.dataNascimento;
      default:
        if (campo.startsWith('participante_')) {
          const index = parseInt(campo.split('_')[1]);
          return !participantes[index]?.nome.trim();
        }
        return false;
    }
  };

  const obterClasseCampo = (campo: string): string => {
    const classeBase = "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent";
    const classeErro = temErro(campo) ? "border-red-500 bg-red-50" : "border-gray-300";
    return `${classeBase} ${classeErro}`;
  };

  const obterClasseCampoParticipante = (campo: string): string => {
    const classeBase = "flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent";
    const classeErro = temErro(campo) ? "border-red-500 bg-red-50" : "border-gray-300";
    return `${classeBase} ${classeErro}`;
  };

  const gerarLabelParticipante = (index: number): string => {
    if (hasConjunto) {
      return `Integrante ${index + 1} *`;
    }
    
    const isSolo = eventosSelecionadosDetalhes.some(evento => evento.modalidade === 'Solo');
    
    if (isSolo) {
      return 'Nome do Participante *';
    }
    
    return `Nome do Participante ${index + 1} *`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-purple-900">Dados do Participante</h2>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-semibold mb-2">Modalidades Selecionadas:</h3>
        <div className="space-y-2">
          {eventosSelecionadosDetalhes.map((evento) => {
            const numeroParticipantes = participantesPorEvento[evento.id] || 1;
            const precoEvento = calcularPrecoInscricao(evento.modalidade, numeroParticipantes);
            
            return (
              <div key={evento.id} className="flex justify-between items-center text-sm">
                <span>
                  {evento.titulo}
                  {evento.modalidade === 'Conjunto' && (
                    <span className="text-gray-600 ml-1">
                      ({numeroParticipantes} participantes)
                    </span>
                  )}
                </span>
                <span className="font-semibold">
                  R$ {precoEvento.toFixed(2).replace('.', ',')}
                </span>
              </div>
            );
          })}
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
              {isResponsavel() ? 'Nome Completo do Responsável *' : 'Nome Completo *'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={dadosInscricao.nome}
                onChange={(e) => atualizarDadosInscricao({ nome: e.target.value })}
                onBlur={() => marcarCampoTocado('nome')}
                className={obterClasseCampo('nome')}
                placeholder={isResponsavel() ? "Nome completo do responsável" : "Seu nome completo"}
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
                onBlur={() => marcarCampoTocado('documento')}
                className={obterClasseCampo('documento')}
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
                onBlur={() => marcarCampoTocado('email')}
                className={obterClasseCampo('email')}
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
                onBlur={() => marcarCampoTocado('celular')}
                className={obterClasseCampo('celular')}
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
                onBlur={() => marcarCampoTocado('dataNascimento')}
                className={obterClasseCampo('dataNascimento')}
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
                {gerarLabelParticipante(index)}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={participante.nome}
                  onChange={(e) => handleParticipanteChange(index, e.target.value)}
                  onBlur={() => marcarCampoTocado(`participante_${index}`)}
                  className={obterClasseCampoParticipante(`participante_${index}`)}
                  placeholder={hasConjunto ? `Nome do integrante ${index + 1}` : 
                              eventosSelecionadosDetalhes.some(evento => evento.modalidade === 'Solo') ? 'Nome do participante' :
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
          onClick={irParaPagamento}
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