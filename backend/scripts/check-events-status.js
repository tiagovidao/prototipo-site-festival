require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkEventsStatus() {
  console.log('🎭 Verificando status dos eventos...\n');

  try {
    // Buscar eventos
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (eventsError) throw eventsError;

    // Buscar inscrições
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('selected_events')
      .eq('status', 'confirmada');

    if (regError) throw regError;

    // Contar inscrições por evento
    const eventCounts = {};
    registrations?.forEach(reg => {
      reg.selected_events?.forEach(eventId => {
        eventCounts[eventId] = (eventCounts[eventId] || 0) + 1;
      });
    });

    console.log('📊 STATUS ATUAL DOS EVENTOS:');
    console.log('═'.repeat(80));

    events.forEach(event => {
      const currentRegistrations = eventCounts[event.id] || 0;
      const availableSpots = Math.max(0, event.total_vacancies - currentRegistrations);
      const occupancyRate = ((currentRegistrations / event.total_vacancies) * 100).toFixed(1);
      
      let status = '🟢 DISPONÍVEL';
      if (availableSpots === 0) {
        status = '🔴 ESGOTADO';
      } else if (availableSpots <= 2) {
        status = '🟡 ÚLTIMAS VAGAS';
      }

      console.log(`${status} ${event.title}`);
      console.log(`   👥 Inscrições: ${currentRegistrations}/${event.total_vacancies} (${occupancyRate}%)`);
      console.log(`   🎫 Vagas restantes: ${availableSpots}`);
      console.log(`   💰 Preço: R$ ${event.price.toFixed(2)}`);
      console.log(`   📅 Data: ${new Date(event.date).toLocaleDateString('pt-BR')}`);
      console.log('   ' + '─'.repeat(50));
    });

    // Estatísticas gerais
    const totalEvents = events.length;
    const totalRegistrations = Object.values(eventCounts).reduce((sum, count) => sum + count, 0);
    const totalRevenue = registrations?.reduce((sum, reg) => {
      // Calcular receita baseada nos eventos selecionados
      const regRevenue = reg.selected_events?.reduce((eventSum, eventId) => {
        const event = events.find(e => e.id === eventId);
        return eventSum + (event ? event.price : 0);
      }, 0) || 0;
      return sum + regRevenue;
    }, 0) || 0;

    const soldOutEvents = events.filter(event => {
      const currentRegs = eventCounts[event.id] || 0;
      return currentRegs >= event.total_vacancies;
    }).length;

    console.log('\n📈 ESTATÍSTICAS GERAIS:');
    console.log('═'.repeat(40));
    console.log(`📋 Total de eventos: ${totalEvents}`);
    console.log(`👥 Total de inscrições: ${totalRegistrations}`);
    console.log(`💰 Receita total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`🔴 Eventos esgotados: ${soldOutEvents}`);
    console.log(`🟢 Eventos disponíveis: ${totalEvents - soldOutEvents}`);

    // Verificar problemas
    const problemEvents = events.filter(event => event.total_vacancies !== 7);
    if (problemEvents.length > 0) {
      console.log('\n⚠️  PROBLEMAS ENCONTRADOS:');
      console.log('═'.repeat(40));
      problemEvents.forEach(event => {
        console.log(`❌ ${event.title}: ${event.total_vacancies} vagas (deveria ser 7)`);
      });
      console.log('\n💡 Para corrigir, execute:');
      console.log('UPDATE events SET total_vacancies = 7 WHERE total_vacancies != 7;');
    } else {
      console.log('\n✅ Todos os eventos têm capacidade correta (7 vagas)');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  }
}

checkEventsStatus();