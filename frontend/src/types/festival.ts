export interface FestivalEvent {
  // Identificação
  id: string;
  titulo: string;
  
  // Categorização conforme regulamento
  estilo: EstiloDanca;
  modalidade: Modalidade;
  categoria: CategoriaIdade;
  
  // Restrições etárias
  idadeMinima: number;
  idadeMaxima: number;
  
  // Informações técnicas
  preco: number;
  tempoLimite: string;
  
  // Localização e datas
  local: string;
  dataInicio: string;
  dataFim: string;
  
  // Disponibilidade
  disponivel: boolean;
  vagas: number;
  totalVagas?: number;
  
  // Conteúdo
  descricao: string;
  observacoes?: string[];
  
  // Metadados
  createdAt?: string;
  updatedAt?: string;
}

// Compatibilidade com sistema antigo
export interface Event extends FestivalEvent {
  title: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  price: string;
  available: boolean;
  vacancies: number;
  totalVacancies: number;
  currentRegistrations?: number;
}

// ===== ENUMS E CONSTANTES =====

export type EstiloDanca =
  | 'Ballet Clássico de Repertório'
  | 'Neoclássico'
  | 'Dança Contemporânea'
  | 'Jazz'
  | 'Danças Urbanas'
  | 'Danças Populares'
  | 'Danças Tradicionais'
  | 'Danças Livres';

export type Modalidade =
  | 'Solo'
  | 'Duo'
  | 'Trio'
  | 'Conjunto'
  | 'Variação Feminina'
  | 'Variação Masculina'
  | 'Pas de Deux'
  | 'Grand Pas de Deux';

export type CategoriaIdade =
  | 'PRÉ (9 a 11 anos)'
  | 'JÚNIOR (12 a 14 anos)'
  | 'SENIOR (15 a 19 anos)'
  | 'AVANÇADO (20+ anos)';

export type StatusInscricao =
  | 'pendente'
  | 'aprovada'
  | 'confirmada'
  | 'cancelada'
  | 'rejeitada';

export type StatusPagamento =
  | 'pendente'
  | 'processando'
  | 'aprovado'
  | 'rejeitado'
  | 'estornado';

// ===== TIPOS DE DADOS =====

export interface DadosInscricao {
  // Dados pessoais obrigatórios
  nome: string;
  documento: string;
  email: string;
  celular: string;
  dataNascimento: string;
  
  // Dados opcionais
  escola?: string;
  coreografo?: string;
  observacoes?: string;
}

export interface InscricaoCompleta extends DadosInscricao {
  // Identificação
  id?: string;
  
  // Seleções
  modalidadesSelecionadas: string[];
  
  // Dados calculados
  precoTotal: number;
  idadeParticipante: number;
  categoriaParticipante: CategoriaIdade;
  
  // Status
  status: StatusInscricao;
  paymentStatus: StatusPagamento;
  paymentMethod?: string;
  
  // Metadados
  createdAt?: string;
  updatedAt?: string;
  
  // Admin
  observacoesAdmin?: string;
}

// ===== TIPOS DE FILTROS =====

export interface FiltrosEvento {
  estilo?: EstiloDanca;
  modalidade?: Modalidade;
  categoria?: CategoriaIdade;
  idadeMin?: number;
  idadeMax?: number;
  precoMin?: number;
  precoMax?: number;
  disponivel?: boolean;
}

export interface FiltrosInscricao {
  status?: StatusInscricao;
  escola?: string;
  modalidade?: Modalidade;
  categoria?: CategoriaIdade;
  dataInicio?: string;
  dataFim?: string;
}

// ===== TIPOS DE RESPOSTA DA API =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EventosResponse extends ApiResponse<FestivalEvent[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InscricaoResponse extends ApiResponse<InscricaoCompleta> {
  proximosPassos?: string[];
}

export interface ValidacaoResponse {
  isValid: boolean;
  conflicts: {
    type: 'documento' | 'email';
    value: string;
    status?: StatusInscricao;
  }[];
  message?: string;
}

// ===== ESTATÍSTICAS =====

export interface EstatisticasFestival {
  // Eventos
  totalEventos: number;
  estilosUnicos: number;
  modalidadesUnicas: number;
  categoriasUnicas: number;
  totalVagas: number;
  
  // Preços
  menorPreco: number;
  maiorPreco: number;
  precoMedio: number;
  
  // Inscrições
  totalInscricoes: number;
  receitaTotal: number;
  
  // Distribuições
  distribuicaoStatus: Record<StatusInscricao, number>;
  distribuicaoIdades: Record<CategoriaIdade, number>;
  distribuicaoModalidades: Record<Modalidade, number>;
}

export interface EstatisticasInscricoes {
  totalInscricoes: number;
  distribuicaoStatus: Record<StatusInscricao, number>;
  receitaTotal: number;
  receitaPorStatus: Record<StatusInscricao, number>;
  distribuicaoIdades: Record<string, number>;
  escolasParticipantes: number;
  mediaModalidadesPorInscricao: number;
}

// ===== TIPOS DE ESTADO DO FRONTEND =====

export interface EstadoInscricoes {
  todosEventos: FestivalEvent[];
  eventosDisponiveis: FestivalEvent[];
  eventosSelecionados: string[];
  
  dadosInscricao: DadosInscricao;
  
  filtros: FiltrosEvento;
  textoBusca: string;
  
  etapaAtual: 'selecao' | 'formulario' | 'pagamento' | 'confirmacao';
  carregando: boolean;
  erros: string[];
  
  precoTotal: number;
  resumoInscricao: {
    quantidadeEventos: number;
    estilosUnicos: string[];
    modalidadesUnicas: string[];
  };
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ===== TIPOS DE CONFIGURAÇÃO =====

export interface ConfiguracaoEvento {
  nome: string;
  descricao: string;
  observacoes?: string[];
}

export interface ConfiguracaoModalidade {
  nome: string;
  preco: number;
  tempoLimite: string;
  observacao?: string;
}

export interface ConfiguracaoCategoria {
  nome: string;
  idadeMin: number;
  idadeMax: number;
  codigo: string;
}

// ===== TIPOS UTILITÁRIOS =====

export interface OpcoesFiltro {
  label: string;
  value: string;
  count?: number;
}

export interface ResumoSelecao {
  eventos: FestivalEvent[];
  precoTotal: number;
  estilos: Set<EstiloDanca>;
  modalidades: Set<Modalidade>;
  categorias: Set<CategoriaIdade>;
}

export interface ValidacaoInscricao {
  valida: boolean;
  erros: string[];
  avisos?: string[];
}

// ===== TIPOS DE PROPS PARA COMPONENTES =====

export interface PropsEventCard {
  evento: FestivalEvent;
  selecionado: boolean;
  onToggle: (eventoId: string) => void;
  disabled?: boolean;
}

export interface PropsFormularioInscricao {
  dados: DadosInscricao;
  onChange: (dados: Partial<DadosInscricao>) => void;
  erros: Record<string, string>;
  onSubmit: () => void;
  carregando: boolean;
}

export interface PropsFiltrosEvento {
  filtros: FiltrosEvento;
  onChange: (filtros: Partial<FiltrosEvento>) => void;
  onLimpar: () => void;
  opcoes: {
    estilos: OpcoesFiltro[];
    modalidades: OpcoesFiltro[];
    categorias: OpcoesFiltro[];
  };
}

