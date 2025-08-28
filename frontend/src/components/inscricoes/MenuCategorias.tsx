import { Filter, X } from 'lucide-react';

interface Estilo {
  nome: string;
}

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

interface MenuCategoriasProps {
  categoriaAtiva: string;
  setCategoriaAtiva: (categoria: string) => void;
  estilosDisponiveis: Estilo[];
  eventosPorEstilo: Record<string, Evento[]>;
  eventosDisponiveis: Evento[];
  menuCategoriasMobileAberto: boolean;
  setMenuCategoriasMobileAberto: (aberto: boolean) => void;
  limparFiltros: () => void;
}

const MenuCategorias = ({
  categoriaAtiva,
  setCategoriaAtiva,
  estilosDisponiveis,
  eventosPorEstilo,
  eventosDisponiveis,
  menuCategoriasMobileAberto,
  setMenuCategoriasMobileAberto,
  limparFiltros,
}: MenuCategoriasProps) => {
  return (
    <>
      <div className="hidden lg:block bg-white p-4 rounded-xl shadow-sm border sticky top-2 z-10 border-purple-200">
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

      <div className="lg:hidden bg-white p-4 rounded-xl shadow-sm border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Filtrar por Estilo</h3>
            <p className="text-sm text-gray-600">
              {categoriaAtiva === 'TODOS' ? 'Todos os Estilos' : categoriaAtiva}
              {categoriaAtiva !== 'TODOS' && eventosPorEstilo[categoriaAtiva] && (
                <span className="ml-2 text-purple-600">
                  ({eventosPorEstilo[categoriaAtiva].length} modalidades)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setMenuCategoriasMobileAberto(true)}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Estilos
          </button>
        </div>
      </div>

      {menuCategoriasMobileAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setMenuCategoriasMobileAberto(false)}
            aria-hidden="true" 
          />
          
          <div 
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-purple-900">Filtrar por Estilo</h3>
              <button 
                onClick={() => setMenuCategoriasMobileAberto(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fechar menu de estilos"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 h-full overflow-y-auto pb-20">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setCategoriaAtiva('TODOS');
                    setMenuCategoriasMobileAberto(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    categoriaAtiva === 'TODOS'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Todos os Estilos</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      categoriaAtiva === 'TODOS'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {eventosDisponiveis.length} total
                    </span>
                  </div>
                </button>
                
                {estilosDisponiveis.map((estilo) => (
                  <button
                    key={estilo.nome}
                    onClick={() => {
                      setCategoriaAtiva(estilo.nome);
                      setMenuCategoriasMobileAberto(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      categoriaAtiva === estilo.nome
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{estilo.nome}</span>
                      {eventosPorEstilo[estilo.nome] && eventosPorEstilo[estilo.nome].length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          categoriaAtiva === estilo.nome
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {eventosPorEstilo[estilo.nome].length}
                        </span>
                      )}
                    </div>
                    {estilo.nome === categoriaAtiva && (
                      <p className="text-sm mt-1 opacity-90">
                        {eventosPorEstilo[estilo.nome] ? eventosPorEstilo[estilo.nome].length : 0} modalidade{eventosPorEstilo[estilo.nome] && eventosPorEstilo[estilo.nome].length !== 1 ? 's' : ''} disponível{eventosPorEstilo[estilo.nome] && eventosPorEstilo[estilo.nome].length !== 1 ? 'is' : ''}
                      </p>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    limparFiltros();
                    setCategoriaAtiva('TODOS');
                    setMenuCategoriasMobileAberto(false);
                  }}
                  className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuCategorias;