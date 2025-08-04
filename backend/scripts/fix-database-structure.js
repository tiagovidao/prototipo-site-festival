require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function fixDatabaseStructure() {
  console.log('🔧 CORRIGINDO ESTRUTURA DO BANCO DE DADOS\n');
  console.log('═'.repeat(50));

  try {
    // Método 1: Tentar inserir com IDs manuais (mais seguro)
    console.log('📝 Tentativa 1: Inserindo eventos com IDs gerados manualmente...');
    
    const sampleEvents = [
      {
        id: 'e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
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
        id: 'f2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7',
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
        id: 'g3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8',
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
        id: 'h4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9',
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
        id: 'i5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0',
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
        id: 'j6f7g8h9-i0j1-k2l3-m4n5-o6p7q8r9s0t1',
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

    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select();

    if (error) {
      console.log('❌ Tentativa 1 falhou:', error.message);
      console.log('\n📋 SOLUÇÃO: Execute o seguinte SQL no painel do Supabase:\n');
      
      const fixSql = `
-- 1. Verificar a estrutura atual da tabela
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' AND table_schema = 'public';

-- 2. Se o campo ID não tem valor padrão, adicionar:
ALTER TABLE events ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Ou recriar a tabela com estrutura correta:
DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
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

-- 4. Configurar RLS (se necessário)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 5. Criar política permissiva
DROP POLICY IF EXISTS "Enable all for events" ON events;
CREATE POLICY "Enable all for events" ON events FOR ALL USING (true) WITH CHECK (true);

-- 6. Inserir dados de exemplo (execute após corrigir a estrutura)
INSERT INTO events (title, instructor, date, time, location, price, available, total_vacancies) VALUES
('BALLET CLÁSSICO JÚNIOR', 'CLÁUDIA ZACCARI', '2025-08-25', '13:30 às 15:00h', 'SALA 01', 250.00, true, 7),
('BALLET CLÁSSICO PRÉ', 'CARIDAD MARTINEZ', '2025-08-25', '15:00 às 16:30h', 'SALA 01', 250.00, true, 7),
('BALLET CONTEMPORÂNEO', 'FELIPE SILVA', '2025-08-26', '10:00 às 12:00h', 'SALA 02', 200.00, true, 7),
('BALLET AVANÇADO', 'AMANDA COSTA', '2025-08-27', '14:00 às 16:00h', 'SALA 03', 220.00, true, 7),
('BALLET INFANTIL', 'RAFAEL SANTOS', '2025-08-28', '16:30 às 18:30h', 'SALA 01', 180.00, true, 7),
('BALLET INICIANTE', 'JULIANA OLIVEIRA', '2025-08-29', '09:00 às 11:00h', 'SALA 04', 240.00, true, 7);
`;
      
      console.log(fixSql);
      console.log('\n📝 INSTRUÇÕES:');
      console.log('1. Vá ao painel do Supabase (https://supabase.com/dashboard)');
      console.log('2. Abra o "SQL Editor"');
      console.log('3. Cole e execute o comando SQL acima');
      console.log('4. Execute este script novamente');
      
      return;
    }

    console.log(`✅ Sucesso! ${data.length} eventos inseridos:`);
    data.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} - R$ ${event.price.toFixed(2)}`);
    });

    // Testar a consulta que o controller faz
    console.log('\n🔍 Testando consulta do controller...');
    await testControllerQuery();

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.log('\n🔧 AÇÃO NECESSÁRIA:');
    console.log('Execute o SQL fornecido acima no painel do Supabase para corrigir a estrutura.');
  }
}

async function testControllerQuery() {
  try {
    // Replicar exatamente a query do eventsController
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (eventsError) {
      console.log('❌ Erro na consulta de eventos:', eventsError.message);
      return;
    }

    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('selected_events')
      .eq('status', 'confirmada');

    if (regError) {
      console.log('❌ Erro na consulta de inscrições:', regError.message);
      return;
    }

    console.log(`✅ Consulta de eventos: ${events?.length || 0} encontrados`);
    console.log(`✅ Consulta de inscrições: ${registrations?.length || 0} encontradas`);

    // Simular o processamento do controller
    const eventCounts = {};
    registrations?.forEach(reg => {
      reg.selected_events?.forEach(eventId => {
        eventCounts[eventId] = (eventCounts[eventId] || 0) + 1;
      });
    });

    const formattedEvents = events?.map(event => {
      const currentRegistrations = eventCounts[event.id] || 0;
      const availableSpots = Math.max(0, event.total_vacancies - currentRegistrations);
      
      return {
        id: event.id,
        title: event.title,
        instructor: event.instructor,
        date: new Date(event.date).toLocaleDateString('pt-BR'),
        time: event.time,
        location: event.location,
        price: `R$ ${event.price.toFixed(2).replace('.', ',')}`,
        available: event.available && availableSpots > 0,
        vacancies: availableSpots,
        totalVacancies: event.total_vacancies,
        currentRegistrations
      };
    }) || [];

    console.log('\n📊 Eventos formatados para o frontend:');
    formattedEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      💰 ${event.price} | 🎫 ${event.vacancies}/${event.totalVacancies} vagas`);
      console.log(`      📅 ${event.date} ${event.time}`);
      console.log(`      🏢 ${event.location} | ✅ ${event.available ? 'Disponível' : 'Indisponível'}`);
      console.log('      ' + '─'.repeat(50));
    });

    console.log('\n✅ TESTE COMPLETO - SISTEMA FUNCIONANDO!');

  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar correção
fixDatabaseStructure();