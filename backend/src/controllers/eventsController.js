// Cole aqui o código do eventsController melhorado
const supabase = require('../config/supabase');

const getEvents = async (req, res) => {
  try {
    console.log('Buscando eventos no Supabase...');
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Erro do Supabase:', error);
      throw error;
    }

    // Buscar contagem atual de inscrições para cada evento
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('selected_events')
      .eq('status', 'confirmada');

    if (regError) {
      console.error('Erro ao buscar inscrições:', regError);
      throw regError;
    }

    // Contar inscrições por evento
    const eventCounts = {};
    registrations?.forEach(reg => {
      reg.selected_events?.forEach(eventId => {
        eventCounts[eventId] = (eventCounts[eventId] || 0) + 1;
      });
    });

    console.log(`✅ ${data?.length || 0} eventos encontrados`);

    // Transformar para o formato esperado pelo frontend
    const formattedEvents = data?.map(event => {
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

    res.json(formattedEvents);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar eventos',
      message: error.message 
    });
  }
};

module.exports = { getEvents };