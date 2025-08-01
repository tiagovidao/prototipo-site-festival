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

    console.log(`✅ ${data?.length || 0} eventos encontrados`);

    // Transformar para o formato esperado pelo frontend
    const formattedEvents = data?.map(event => ({
      id: event.id,
      title: event.title,
      instructor: event.instructor,
      date: new Date(event.date).toLocaleDateString('pt-BR'),
      time: event.time,
      location: event.location,
      price: `R$ ${event.price.toFixed(2).replace('.', ',')}`,
      available: event.available,
      vacancies: event.vacancies,
      totalVacancies: event.total_vacancies
    })) || [];

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