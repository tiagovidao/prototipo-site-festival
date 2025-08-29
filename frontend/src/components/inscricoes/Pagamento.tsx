interface PagamentoProps {
  precoTotal: number;
  irParaEtapa: (etapa: string) => void;
  resetarInscricao: () => void;
}

const Pagamento = ({ precoTotal, irParaEtapa, resetarInscricao }: PagamentoProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">Finalizar Inscrição</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Inscrição Validada com Sucesso!
          </h3>
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
};

export default Pagamento;