// config/festivalEventsConfig.ts
// Configuração dos eventos baseada no regulamento FID BSB v1.1

export interface FestivalEvent {
  id: string;
  titulo: string;
  estilo: string;
  modalidade: string;
  categoria: string;
  idadeMinima: number;
  idadeMaxima: number;
  preco: number;
  tempoLimite: string;
  local: string;
  dataInicio: string;
  dataFim: string;
  disponivel: boolean;
  vagas: number;
  descricao: string;
  observacoes?: string[];
}

// Definição dos estilos conforme regulamento
export const ESTILOS_DANCA = {
  BALLET_CLASSICO: {
    nome: "Ballet Clássico de Repertório",
    descricao: "Trechos de balés consagrados até o séc. XIX",
    observacoes: ["Não serão aceitos Ballets do séc. XX por motivos de direitos autorais"]
  },
  NEOCLASSICO: {
    nome: "Neoclássico", 
    descricao: "Modalidade Clássica mais flexível, menos rígida, mais aventureira, contempla obras de criação autoral"
  },
  CONTEMPORANEO: {
    nome: "Dança Contemporânea",
    descricao: "Todas as formas experimentais de dança e pesquisa do movimento, com abertura para dança teatro"
  },
  JAZZ: {
    nome: "Jazz",
    descricao: "Trabalhos que utilizem técnicas provenientes de todas as linhas do Jazz"
  },
  URBANAS: {
    nome: "Danças Urbanas",
    descricao: "Trabalhos provenientes de contextos sociais e culturais das ruas e comunidades urbanas"
  },
  POPULARES: {
    nome: "Danças Populares",
    descricao: "Manifestações culturais transmitidas de geração em geração"
  },
  TRADICIONAIS: {
    nome: "Danças Tradicionais", 
    descricao: "Dança Flamenca, Dança do Ventre"
  },
  LIVRES: {
    nome: "Danças Livres",
    descricao: "Todas as danças que não se enquadrem nas demais ou quando for uma mistura de estilos"
  }
} as const;

// Modalidades e seus preços conforme regulamento
export const MODALIDADES_PRECOS = {
  SOLO: { nome: "Solo", preco: 80.00, tempoLimite: "até 3 minutos" },
  VARIACAO_FEMININA: { nome: "Variação Feminina", preco: 80.00, tempoLimite: "tempo da obra" },
  VARIACAO_MASCULINA: { nome: "Variação Masculina", preco: 80.00, tempoLimite: "tempo da obra" },
  DUO: { nome: "Duo", preco: 140.00, tempoLimite: "até 5 minutos" },
  TRIO: { nome: "Trio", preco: 195.00, tempoLimite: "até 5 minutos" },
  PAS_DE_DEUX: { nome: "Pas de Deux", preco: 160.00, tempoLimite: "tempo da obra" },
  GRAND_PAS_DE_DEUX: { nome: "Grand Pas de Deux", preco: 200.00, tempoLimite: "tempo da obra" },
  CONJUNTO: { nome: "Conjunto", preco: 45.00, tempoLimite: "até 6 minutos", observacao: "R$ 45,00 por participante, mínimo 4 bailarinos" }
} as const;

// Categorias por idade conforme regulamento  
export const CATEGORIAS_IDADE = {
  PRE: { nome: "PRÉ", idadeMin: 9, idadeMax: 11, codigo: "PRE_09_11" },
  JUNIOR: { nome: "JÚNIOR", idadeMin: 12, idadeMax: 14, codigo: "JUNIOR_12_14" },
  SENIOR: { nome: "SENIOR", idadeMin: 15, idadeMax: 19, codigo: "SENIOR_15_19" },  
  AVANCADO: { nome: "AVANÇADO", idadeMin: 20, idadeMax: 99, codigo: "AVANCADO_20_MAIS" }
} as const;

// Função para gerar automaticamente todos os eventos possíveis
export function gerarEventosFestival(): FestivalEvent[] {
  const eventos: FestivalEvent[] = [];
  
  // Mapeamento de estilos para modalidades disponíveis
  const estilosModalidades = {
    BALLET_CLASSICO: ['VARIACAO_FEMININA', 'VARIACAO_MASCULINA', 'PAS_DE_DEUX', 'GRAND_PAS_DE_DEUX', 'CONJUNTO'],
    NEOCLASSICO: ['SOLO', 'DUO', 'TRIO', 'CONJUNTO'],
    CONTEMPORANEO: ['SOLO', 'DUO', 'TRIO', 'CONJUNTO'],
    JAZZ: ['SOLO', 'DUO', 'TRIO', 'CONJUNTO'],
    URBANAS: ['SOLO', 'DUO', 'TRIO', 'CONJUNTO'],
    LIVRES: ['SOLO', 'DUO', 'TRIO', 'CONJUNTO'],
    POPULARES: ['CONJUNTO'], // Apenas conjunto conforme regulamento
    TRADICIONAIS: ['SOLO', 'DUO', 'TRIO', 'CONJUNTO']
  };

  // Gerar eventos para cada combinação válida
  Object.entries(estilosModalidades).forEach(([estiloKey, modalidades]) => {
    const estilo = ESTILOS_DANCA[estiloKey as keyof typeof ESTILOS_DANCA];
    
    modalidades.forEach(modalidadeKey => {
      const modalidade = MODALIDADES_PRECOS[modalidadeKey as keyof typeof MODALIDADES_PRECOS];
      
      Object.values(CATEGORIAS_IDADE).forEach(categoria => {
        // Aplicar regra especial: Ballet clássico obrigatório sapatilha de ponta apenas a partir de JÚNIOR
        const observacoes: string[] = [];
        if (estiloKey === 'BALLET_CLASSICO' && categoria.codigo !== 'PRE_09_11') {
          observacoes.push('Obrigatório uso de sapatilhas de ponta para obras de repertório clássico');
        }

        const eventoId = `${estiloKey}_${modalidadeKey}_${categoria.codigo}`;
        
        eventos.push({
          id: eventoId,
          titulo: `${estilo.nome} - ${modalidade.nome} (${categoria.nome})`,
          estilo: estilo.nome,
          modalidade: modalidade.nome,
          categoria: `${categoria.nome} (${categoria.idadeMin} a ${categoria.idadeMax} anos)`,
          idadeMinima: categoria.idadeMin,
          idadeMaxima: categoria.idadeMax,
          preco: modalidade.preco,
          tempoLimite: modalidade.tempoLimite,
          local: "Teatro Nacional Cláudio Santoro - Brasília/DF",
          dataInicio: "2025-10-16",
          dataFim: "2025-10-18", 
          disponivel: true,
          vagas: 7, // Padrão conforme mencionado nos scripts
          descricao: estilo.descricao,
          observacoes: observacoes.length > 0 ? observacoes : undefined
        });
      });
    });
  });

  return eventos;
}

// Função para filtrar eventos por critérios
export function filtrarEventos(
  eventos: FestivalEvent[], 
  filtros: {
    estilo?: string;
    modalidade?: string; 
    categoria?: string;
    idadeBailarino?: number;
    precMax?: number;
  }
): FestivalEvent[] {
  return eventos.filter(evento => {
    if (filtros.estilo && evento.estilo !== filtros.estilo) return false;
    if (filtros.modalidade && evento.modalidade !== filtros.modalidade) return false;
    if (filtros.categoria && evento.categoria !== filtros.categoria) return false;
    if (filtros.idadeBailarino && 
        (filtros.idadeBailarino < evento.idadeMinima || filtros.idadeBailarino > evento.idadeMaxima)) {
      return false;
    }
    if (filtros.precMax && evento.preco > filtros.precMax) return false;
    
    return true;
  });
}

// Função para calcular preço total baseado na modalidade
export function calcularPrecoInscricao(modalidade: string, numeroBailarinos: number = 1): number {
  const modalidadeInfo = Object.values(MODALIDADES_PRECOS).find(m => m.nome === modalidade);
  if (!modalidadeInfo) return 0;
  
  // Para conjunto, é preço por bailarino
  if (modalidade === 'Conjunto') {
    return modalidadeInfo.preco * numeroBailarinos;
  }
  
  return modalidadeInfo.preco;
}

// Função para validar se uma inscrição está conforme o regulamento
export function validarInscricao(dados: {
  idade: number;
  estilo: string;
  modalidade: string;
  numeroBailarinos?: number;
}): { valida: boolean; erros: string[] } {
  const erros: string[] = [];
  
  // Validar idade conforme categoria
  const categoriaValida = Object.values(CATEGORIAS_IDADE).find(cat => 
    dados.idade >= cat.idadeMin && dados.idade <= cat.idadeMax
  );
  
  if (!categoriaValida) {
    erros.push(`Idade ${dados.idade} não se enquadra em nenhuma categoria válida`);
  }
  
  // Validar número de bailarinos para conjunto
  if (dados.modalidade === 'Conjunto' && dados.numeroBailarinos && dados.numeroBailarinos < 4) {
    erros.push('Modalidade Conjunto requer mínimo de 4 bailarinos');
  }
  
  // Validar combinação estilo-modalidade
  const estilosModalidades = {
    'Ballet Clássico de Repertório': ['Variação Feminina', 'Variação Masculina', 'Pas de Deux', 'Grand Pas de Deux', 'Conjunto'],
    'Neoclássico': ['Solo', 'Duo', 'Trio', 'Conjunto'],
    'Dança Contemporânea': ['Solo', 'Duo', 'Trio', 'Conjunto'],
    'Jazz': ['Solo', 'Duo', 'Trio', 'Conjunto'],
    'Danças Urbanas': ['Solo', 'Duo', 'Trio', 'Conjunto'],
    'Danças Livres': ['Solo', 'Duo', 'Trio', 'Conjunto'],
    'Danças Populares': ['Conjunto'],
    'Danças Tradicionais': ['Solo', 'Duo', 'Trio', 'Conjunto']
  };
  
  const modalidadesPermitidas = estilosModalidades[dados.estilo as keyof typeof estilosModalidades];
  if (!modalidadesPermitidas?.includes(dados.modalidade)) {
    erros.push(`Modalidade '${dados.modalidade}' não é permitida para o estilo '${dados.estilo}'`);
  }
  
  return {
    valida: erros.length === 0,
    erros
  };
}

// Exportar lista de eventos pré-configurados
export const EVENTOS_FESTIVAL = gerarEventosFestival();