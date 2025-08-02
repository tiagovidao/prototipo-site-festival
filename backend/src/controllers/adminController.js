// src/controllers/adminController.js
const supabase = require('../config/supabase');

const getAdminDashboard = async (req, res) => {
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
      .select('*')
      .order('created_at', { ascending: false });

    if (regError) throw regError;

    // Calcular estatísticas por evento
    const eventStats = events.map(event => {
      const eventRegistrations = registrations.filter(reg => 
        reg.selected_events?.includes(event.id) && reg.status === 'confirmada'
      );

      return {
        ...event,
        currentRegistrations: eventRegistrations.length,
        availableSpots: Math.max(0, event.total_vacancies - eventRegistrations.length),
        registrations: eventRegistrations.map(reg => ({
          id: reg.id,
          nome: reg.nome,
          email: reg.email,
          documento: reg.documento,
          celular: reg.celular,
          created_at: reg.created_at
        }))
      };
    });

    // Estatísticas gerais
    const totalRegistrations = registrations.filter(r => r.status === 'confirmada').length;
    const totalRevenue = registrations
      .filter(r => r.status === 'confirmada')
      .reduce((sum, r) => sum + (r.total_amount || 0), 0);

    const stats = {
      totalEvents: events.length,
      totalRegistrations,
      totalRevenue,
      pendingRegistrations: registrations.filter(r => r.status === 'pendente').length,
      cancelledRegistrations: registrations.filter(r => r.status === 'cancelada').length
    };

    res.json({
      stats,
      events: eventStats,
      recentRegistrations: registrations.slice(0, 10)
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar dados do dashboard',
      message: error.message 
    });
  }
};

module.exports = { getAdminDashboard };