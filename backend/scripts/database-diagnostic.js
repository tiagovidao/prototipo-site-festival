require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function diagnosticAndSetup() {
  console.log('🔍 DIAGNÓSTICO DO BANCO DE DADOS\n');
  console.log('═'.repeat(50));

  try {
    // 1. Verificar se a tabela events existe
    console.log('1. Verificando tabela events...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    if (eventsError) {
      console.log('❌ Erro ao acessar tabela events:', eventsError.message);
      
      if (eventsError.message.includes('relation "public.events" does not exist')) {
        console.log('\n🛠️  CRIANDO ESTRUTURA DO BANCO...\n');
        await createDatabaseStructure();
        return;
      }
      throw eventsError;
    }

    console.log(`✅ Tabela events existe. Registros encontrados: ${events?.length || 0}`);

    // 2. Se a tabela existe mas está vazia, popular com dados
    if (!events || events.length === 0) {
      console.log('\n📝 Tabela vazia. Populando com eventos de exemplo...');
      await populateEvents();
    } else {
      console.log('\n📊 Eventos existentes:');
      events.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title} - ${event.date}`);
      });
    }

    // 3. Verificar outras tabelas necessárias
    await checkOtherTables();

    // 4. Testar operações CRUD básicas
    await testCrudOperations();

    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO COM SUCESSO!');
    console.log('🚀 O sistema está pronto para uso.');

  } catch (error) {
    console.error('\n❌ ERRO NO DIAGNÓSTICO:', error.message);
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verifique se as credenciais do Supabase estão corretas no .env');
    console.log('2. Certifique-se de que o projeto Supabase está ativo');
    console.log('3. Verifique se as tabelas foram criadas no painel do Supabase');
    console.log('4. Confirme se a SUPABASE_ANON_KEY tem as permissões necessárias');
  }
}

async function createDatabaseStructure() {
  console.log('📋 SQL para criar as tabelas necessárias:');
  console.log('(Execute este SQL no painel do Supabase)\n');
  
  const sqlCommands = `
-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT true,
  total_vacancies INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inscrições
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  celular VARCHAR(20) NOT NULL,
  data_nascimento DATE NOT NULL,
  selected_events UUID[] NOT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'confirmada' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cidade VARCHAR(255),
  escola VARCHAR(255),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de doações
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  comprovantes TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_available ON events(available);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_documento ON registrations(documento);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);

-- Configurar RLS (Row Level Security) - opcional
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir leitura/escrita para usuários anônimos)
CREATE POLICY IF NOT EXISTS "Enable read for all users" ON events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON events FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable read for all users" ON registrations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON registrations FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable read for all users" ON contacts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON contacts FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable read for all users" ON donations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON donations FOR UPDATE USING (true);
`;

  console.log(sqlCommands);
  console.log('\n📝 Após executar o SQL, execute este script novamente para popular os dados.');
}

async function populateEvents() {
  const sampleEvents = [
    {
      title: 'BALLET CLÁSSICO JÚNIOR',
      instructor: 'CLÁUDIA ZACCARI',
      date: '2025-08-25',
      time: '13:30 às 15:00h',
      location: 'SALA 01',
      price: 250.00,
      available: true,
      total_vacancies: 7
    },
    {
      title: 'BALLET CLÁSSICO PRÉ',
      instructor: 'CARIDAD MARTINEZ',
      date: '2025-08-25',
      time: '15:00 às 16:30h',
      location: 'SALA 01',
      price: 250.00,
      available: true,
      total_vacancies: 7
    },
    {
      title: 'BALLET CONTEMPORÂNEO',
      instructor: 'FELIPE SILVA',
      date: '2025-08-26',
      time: '10:00 às 12:00h',
      location: 'SALA 02',
      price: 200.00,
      available: true,
      total_vacancies: 7
    },
    {
      title: 'BALLET AVANÇADO',
      instructor: 'AMANDA COSTA',
      date: '2025-08-27',
      time: '14:00 às 16:00h',
      location: 'SALA 03',
      price: 220.00,
      available: true,
      total_vacancies: 7
    },
    {
      title: 'BALLET INFANTIL',
      instructor: 'RAFAEL SANTOS',
      date: '2025-08-28',
      time: '16:30 às 18:30h',
      location: 'SALA 01',
      price: 180.00,
      available: true,
      total_vacancies: 7
    },
    {
      title: 'BALLET INICIANTE',
      instructor: 'JULIANA OLIVEIRA',
      date: '2025-08-29',
      time: '09:00 às 11:00h',
      location: 'SALA 04',
      price: 240.00,
      available: true,
      total_vacancies: 7
    }
  ];

  try {
    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select();

    if (error) throw error;

    console.log(`✅ ${data.length} eventos inseridos com sucesso!`);
    
    data.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} - R$ ${event.price.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Erro ao popular eventos:', error.message);
    throw error;
  }
}

async function checkOtherTables() {
  console.log('\n2. Verificando outras tabelas...');
  
  const tables = ['registrations', 'contacts', 'donations'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Tabela '${table}': ${error.message}`);
      } else {
        console.log(`✅ Tabela '${table}': OK`);
      }
    } catch (error) {
      console.log(`❌ Tabela '${table}': ${error.message}`);
    }
  }
}

async function testCrudOperations() {
  console.log('\n3. Testando operações básicas...');
  
  try {
    // Testar leitura
    const { data: events } = await supabase
      .from('events')
      .select('id, title')
      .limit(1);
    
    console.log('✅ Leitura: OK');
    
    if (events && events.length > 0) {
      // Testar contagem de inscrições
      const { data: registrations } = await supabase
        .from('registrations')
        .select('selected_events')
        .eq('status', 'confirmada');
      
      console.log('✅ Consulta de inscrições: OK');
      
      const eventId = events[0].id;
      const count = registrations?.reduce((acc, reg) => {
        return acc + (reg.selected_events?.includes(eventId) ? 1 : 0);
      }, 0) || 0;
      
      console.log(`✅ Contagem para evento "${events[0].title}": ${count} inscrições`);
    }
    
  } catch (error) {
    console.log('❌ Erro nos testes:', error.message);
  }
}

// Executar diagnóstico
diagnosticAndSetup();