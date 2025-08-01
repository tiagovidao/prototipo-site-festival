const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis do Supabase não encontradas!');
  console.log('Verifique se SUPABASE_URL e SUPABASE_ANON_KEY estão no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Testar conexão
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('events').select('count').limit(1);
    if (error) {
      console.warn('⚠️  Aviso: Erro ao conectar com Supabase:', error.message);
    } else {
      console.log('✅ Conexão com Supabase estabelecida');
    }
  } catch (err) {
    console.warn('⚠️  Aviso: Não foi possível testar conexão com Supabase');
  }
};

testConnection();

module.exports = supabase;