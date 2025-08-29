import { Search, Filter, X } from 'lucide-react';

interface ModalidadeOption {
  nome: string;
  preco: number;
}

interface CategoriaOption {
  codigo: string;
  nome: string;
  idadeMin: number;
  idadeMax: number;
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

interface FiltrosProps {
  filtros: FiltrosEvento;
  textoBusca: string;
  filtrosAbertos: boolean;
  modalidadesDisponiveis: ModalidadeOption[];
  categoriasDisponiveis: CategoriaOption[];
  atualizarFiltros: (filtros: Partial<FiltrosEvento>) => void;
  atualizarBusca: (texto: string) => void;
  limparFiltros: () => void;
  toggleFiltros: () => void;
}

const Filtros = ({
  filtros,
  textoBusca,
  filtrosAbertos,
  modalidadesDisponiveis,
  categoriasDisponiveis,
  atualizarFiltros,
  atualizarBusca,
  limparFiltros,
  toggleFiltros,
}: FiltrosProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border-purple-200">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
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

      <div className={`${filtrosAbertos ? 'block' : 'hidden'} md:block transition-all duration-300`}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
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
  );
};

export default Filtros;