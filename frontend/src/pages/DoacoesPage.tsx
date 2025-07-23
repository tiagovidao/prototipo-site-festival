import React from 'react';
import { FileText, X, Check, Upload } from 'lucide-react';

interface DoacoesProps {
  donationForm: {
    nome: string;
    email: string;
    comprovantes: File[];
  };
  setDonationForm: React.Dispatch<React.SetStateAction<{
    nome: string;
    email: string;
    comprovantes: File[];
  }>>;
  donationStatus: 'idle' | 'uploading' | 'success' | 'error';
  handleDonationSubmit: (e: React.FormEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>; // ✅ CORRIGIDO AQUI
}


const Doacoes: React.FC<DoacoesProps> = ({
  donationForm,
  setDonationForm,
  donationStatus,
  handleDonationSubmit,
  handleFileChange,
  handleRemoveFile,
  fileInputRef
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center pb-6 border-b border-stone-200 dark:border-stone-700">
        Doações
      </h1>
      
      <div className="p-8 rounded-lg mb-8 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
        <p className="mb-6 text-stone-700 dark:text-stone-300">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet nulla sed nisl tristique sagittis. Nulla facilisi. 
        </p>
        <div className="border-l-4 p-4 text-stone-700 dark:text-stone-300 border-amber-600 dark:border-amber-500 bg-white dark:bg-stone-800">
          <p className="font-medium">Informações bancárias:</p>
          <p>
            Banco: Banco do Brasil (001)<br/>
            Agência: 1234-5<br/>
            Conta Corrente: 44444-4<br/>
            CNPJ: 12.345.678/0001-90
          </p>
        </div>
      </div>
      
      <form onSubmit={handleDonationSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold mb-2 text-stone-900 dark:text-stone-100">
          Envie seus comprovantes
        </h2>
        
        <div>
          <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
            Nome completo *
          </label>
          <input
            type="text"
            value={donationForm.nome}
            onChange={(e) => setDonationForm({ ...donationForm, nome: e.target.value })}
            className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-stone-800"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
            Email *
          </label>
          <input
            type="email"
            value={donationForm.email}
            onChange={(e) => setDonationForm({ ...donationForm, email: e.target.value })}
            className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-stone-800"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
            Comprovantes de transferência *
          </label>
          
          {donationForm.comprovantes.length > 0 && (
            <div className="mb-4 space-y-2">
              {donationForm.comprovantes.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-md bg-stone-100 dark:bg-stone-700"
                >
                  <div className="flex items-center truncate">
                    <FileText className="w-5 h-5 mr-2 flex-shrink-0 text-stone-600 dark:text-stone-300" />
                    <span className="truncate text-sm">{file.name}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700" 
                    aria-label="Remover arquivo"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="comprovantes" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-stone-300 dark:border-stone-600 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700/50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-stone-600 dark:text-stone-400">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium mb-1">
                  {donationForm.comprovantes.length > 0 ? 'Adicionar mais' : 'Clique para enviar'}
                </p>
                <p className="text-xs">JPG, PNG ou PDF</p>
              </div>
              <input 
                id="comprovantes" 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".jpg,.jpeg,.png,.pdf" 
                multiple 
              />
            </label>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={donationStatus === 'uploading'}
          className={`w-full flex items-center justify-center gap-2 text-white px-6 py-4 rounded-md transition-colors ${
            donationStatus === 'uploading' 
              ? 'bg-stone-500 cursor-not-allowed' 
              : 'bg-amber-700 hover:bg-amber-800'
          }`}
        >
          {donationStatus === 'uploading' ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : donationStatus === 'success' ? (
            <>
              <Check className="w-5 h-5" />
              Enviado!
            </>
          ) : (
            'Enviar Comprovantes'
          )}
        </button>
      </form>
    </div>
  );
};

export default Doacoes;