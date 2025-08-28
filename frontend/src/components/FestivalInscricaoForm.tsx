import { useFestivalInscricoes } from '../hooks/useFestivalInscricoes';
import { Search, Filter, Users, Trophy, Clock, DollarSign, ChevronDown, ChevronUp, MapPin, Calendar, User, Mail, Phone, FileText, X, Plus, Minus } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

interface EventoCard {
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
    calcularIdade
  } = useFestivalInscricoes();

  const [categoriaAtiva, setCategoriaAtiva] = useState('TODOS');
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<string, boolean>>({});
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [participantes, setParticipantes] = useState([{ nome: '' }]);

  // Determinar se há eventos de conjunto selecionados
  const hasConjunto = useMemo(() => {
    return eventosSelecionadosDetalhes.some(evento => evento.modalidade === 'Conjunto');
  }, [eventosSelecionadosDetalhes]);

  // Atualizar participantes quando a modalidade muda
  useEffect(() => {
    if (eventosSelecionadosDetalhes.length > 0) {
      const modalidades = eventosSelecionadosDetalhes.map(e => e.modalidade);
      
      // Definir número inicial de participantes baseado na modalidade
      let numParticipantes = 1;
      
      if (modalidades.includes('Conjunto')) {
        numParticipantes = 4;
      } else if (modalidades.includes('Trio')) {
        numParticipantes = 3;
      } else if (modalidades.some(m => ['Duo', 'Pas de Deux', 'Grand Pas de Deux'].includes(m))) {
        numParticipantes = 2;
      }
      
      setParticipantes(Array.from({ length: numParticipantes }, (_, i) => 
        i < participantes.length ? participantes[i] : { nome: '' }
      ).slice(0, numParticipantes));
    }
  }, [eventosSelecionadosDetalhes]);

  // Agrupar eventos por estilo
  const eventosPorEstilo = useMemo(() => {
    const agrupados: Record<string, typeof eventosDisponiveis> = {};
    
    estilosDisponiveis.forEach(estilo => {
      agrupados[estilo.nome] = eventosDisponiveis.filter(evento => 
        evento.estilo === estilo.nome
      );
    });
    
    return agrupados;
  }, [eventosDisponiveis, estilosDisponiveis]);

  // Expandir automaticamente categorias com eventos selecionados
  useMemo(() => {
    if (eventosSelecionados.length > 0) {
      const novasCategoriasExpandidas: Record<string, boolean> = {};
      
      eventosSelecionados.forEach(eventoId => {
        const evento = eventosDisponiveis.find(e => e.id === eventoId);
        if (evento && !categoriasExpandidas[evento.estilo]) {
          novasCategoriasExpandidas[evento.estilo] = true;
        }
      });
      
      if (Object.keys(novasCategoriasExpandidas).length > 0) {
        setCategoriasExpandidas(prev => ({ ...prev, ...novasCategoriasExpandidas }));
      }
    }
  }, [eventosSelecionados]);

  // Função para selecionar apenas um evento (nova implementação)
  const selecionarEventoUnico = (eventoId: string) => {
    // Se o evento já está selecionado, desseleciona
    if (eventosSelecionados.includes(eventoId)) {
      toggleEventoSelecao(eventoId);
    } else {
      // Remove todos os eventos selecionados antes de adicionar o novo
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

  const adicionarParticipante = () => {
    if (participantes.length < 20) { // Limite máximo de participantes
      setParticipantes([...participantes, { nome: '' }]);
    }
  };

  const removerParticipante = (index: number) => {
    if (participantes.length > 1) {
      const novosParticipantes = [...participantes];
      novosParticipantes.splice(index, 1);
      setParticipantes(novosParticipantes);
    }
  };

  const handleParticipanteChange = (index: number, value: string) => {
    const novosParticipantes = [...participantes];
    novosParticipantes[index].nome = value;
    setParticipantes(novosParticipantes);
    
    atualizarDadosInscricao({ 
      ...dadosInscricao, 
      participantes: novosParticipantes 
    });
  };

  const EventoCard = ({ evento, selecionado, onToggle }: { 
    evento: EventoCard; 
    selecionado: boolean; 
    onToggle: () => void; 
  }) => (
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

  const renderSelecaoEventos = () => (
    <div className="space-y-6">
      {/* Header */}
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
            As inscrições seguem rigorosamente o regulamento oficial.
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl shadow-sm border-purple-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar modalidade..."
              value={textoBusca}
              onChange={(e) => atualizarBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={toggleFiltros}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 md:hidden"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Filtros expandidos (mobile) ou sempre visíveis (desktop) */}
        <div className={`${filtrosAbertos ? 'block' : 'hidden'} md:block transition-all duration-300`}>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Filtro por Modalidade */}
            <select
              value={filtros.modalidade || ''}
              onChange={(e) => atualizarFiltros({ modalidade: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 flex-1"
            >
              <option value="">Todas as Modalidades</option>
              {modalidadesDisponiveis.map((modalidade) => (
                <option key={modalidade.nome} value={modalidade.nome}>
                  {modalidade.nome} - R$ {modalidade.preco.toFixed(2).replace('.', ',')}
                </option>
              ))}
            </select>

            {/* Filtro por Categoria */}
            <select
              value={filtros.categoria || ''}
              onChange={(e) => atualizarFiltros({ categoria: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 flex-1"
            >
              <option value="">Todas as Categorias</option>
              {categoriasDisponiveis.map((categoria) => (
                <option key={categoria.codigo} value={categoria.nome}>
                  {categoria.nome} ({categoria.idadeMin} a {categoria.idadeMax} anos)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={limparFiltros}
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Navegação por categorias */}
      <div className="bg-white p-4 rounded-xl shadow-sm border sticky top-2 z-10 border-purple-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoriaAtiva('TODOS')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoriaAtiva === 'TODOS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos os Estilos
          </button>
          {estilosDisponiveis.map((estilo) => (
            <button
              key={estilo.nome}
              onClick={() => setCategoriaAtiva(estilo.nome)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoriaAtiva === estilo.nome
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estilo.nome}
              {eventosPorEstilo[estilo.nome] && eventosPorEstilo[estilo.nome].length > 0 && (
                <span className="ml-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                  {eventosPorEstilo[estilo.nome].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {categoriaAtiva === 'TODOS' ? (
          // Mostrar todos os eventos agrupados por categoria
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
                    {eventos.map((evento) => (
                      <EventoCard 
                        key={evento.id} 
                        evento={evento} 
                        selecionado={eventosSelecionados.includes(evento.id)}
                        onToggle={() => selecionarEventoUnico(evento.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null
          )
        ) : (
          // Mostrar apenas eventos da categoria selecionada
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventosPorEstilo[categoriaAtiva]?.map((evento) => (
              <EventoCard 
                key={evento.id} 
                evento={evento} 
                selecionado={eventosSelecionados.includes(evento.id)}
                onToggle={() => selecionarEventoUnico(evento.id)}
              />
            ))}
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

      {/* Resumo e Navegação */}
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

      {/* Erros */}
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

  const renderFormularioDados = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-purple-900">Dados do Participante</h2>
        <button
          onClick={() => irParaEtapa('selecao')}
          className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          ← Voltar
        </button>
      </div>

      {/* Resumo Selecionado */}
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

      {/* Formulário */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
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
                value={dadosInscricao.documento}
                onChange={(e) => atualizarDadosInscricao({ documento: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="000.000.000-00"
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
                value={dadosInscricao.celular}
                onChange={(e) => atualizarDadosInscricao({ celular: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="(61) 99999-9999"
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
            {dadosInscricao.dataNascimento && (
              <p className="text-sm text-gray-600 mt-1">
                Idade: {calcularIdade(dadosInscricao.dataNascimento)} anos
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escola/Grupo (opcional)
            </label>
            <input
              type="text"
              value={dadosInscricao.escola}
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
              value={dadosInscricao.coreografo}
              onChange={(e) => atualizarDadosInscricao({ coreografo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nome do coreógrafo"
            />
          </div>
        </div>

        {/* Campos de participantes baseados na modalidade */}
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
            value={dadosInscricao.observacoes}
            onChange={(e) => atualizarDadosInscricao({ observacoes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Informações adicionais sobre sua participação..."
          />
        </div>
      </div>

      {/* Navegação */}
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

      {/* Erros */}
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

  const renderPagamento = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">Finalizar Inscrição</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Inscrição Validada com Sucesso!
          </h3>
          <p className="text-green-700 mb-4">
            Sua inscrição está de acordo com o regulamento do festival.
          </p>
          <div className="text-3xl font-bold text-green-600">
            Total: R$ {precoTotal.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-semibold text-lg mb-4">Próximos Passos:</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">1</div>
            <p>Envie um email para <strong>contato@fidbsb.com</strong> com seus dados e modalidades selecionadas</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">2</div>
            <p>Aguarde a confirmação da organização</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
            <p>Realize o pagamento conforme orientações recebidas</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => irParaEtapa('formulario')}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={resetarInscricao}
          className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          Nova Inscrição
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {etapaAtual === 'selecao' && renderSelecaoEventos()}
        {etapaAtual === 'formulario' && renderFormularioDados()}
        {etapaAtual === 'pagamento' && renderPagamento()}
      </div>
    </div>
  );
};

export default FestivalInscricaoForm;