const supabase = require('../config/supabase');

const getEvents = async (req, res) => {
  try {
    console.log('🎭 Buscando eventos do FID BSB...');
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('disponivel', true) 
      .order('estilo', { ascending: true })
      .order('modalidade', { ascending: true })
      .order('idade_minima', { ascending: true });

    if (eventsError) {
      console.error('❌ Erro do Supabase:', eventsError);
      throw eventsError;
    }

    console.log(`✅ ${events?.length || 0} eventos encontrados`);

    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('modalidades_selecionadas')
      .in('status', ['pendente', 'confirmada', 'aprovada']);

    if (regError) {
      console.error('⚠️ Aviso ao buscar inscrições:', regError.message);
    }

    const eventCounts = {};
    if (registrations) {
      registrations.forEach(reg => {
        if (reg.modalidades_selecionadas && Array.isArray(reg.modalidades_selecionadas)) {
          reg.modalidades_selecionadas.forEach(eventoId => {
            eventCounts[eventoId] = (eventCounts[eventoId] || 0) + 1;
          });
        }
      });
    }

    const formattedEvents = events?.map(evento => {
      const currentRegistrations = eventCounts[evento.id] || 0;
      const availableSpots = Math.max(0, evento.vagas - currentRegistrations);
      
      return {
        id: evento.id,
        titulo: evento.titulo,
        estilo: evento.estilo,
        modalidade: evento.modalidade,
        categoria: evento.categoria,
        idadeMinima: evento.idade_minima,
        idadeMaxima: evento.idade_maxima,
        preco: evento.preco,
        tempoLimite: evento.tempo_limite,
        local: evento.local,
        dataInicio: evento.data_inicio,
        dataFim: evento.data_fim,
        disponivel: evento.disponivel && availableSpots > 0,
        vagas: availableSpots,
        totalVagas: evento.vagas,
        descricao: evento.descricao,
        observacoes: evento.observacoes,
        
        title: evento.titulo,
        instructor: evento.estilo, // Adaptação
        date: new Date(evento.data_inicio).toLocaleDateString('pt-BR'),
        time: `${evento.data_inicio} a ${evento.data_fim}`,
        location: evento.local,
        price: `R$ ${evento.preco.toFixed(2).replace('.', ',')}`,
        available: evento.disponivel && availableSpots > 0,
        vacancies: availableSpots,
        totalVacancies: evento.vagas,
        currentRegistrations
      };
    }) || [];

    console.log('\n📊 RESUMO DOS EVENTOS:');
    const resumo = formattedEvents.reduce((acc, evento) => {
      acc.estilos.add(evento.estilo);
      acc.modalidades.add(evento.modalidade);
      acc.categorias.add(evento.categoria);
      acc.precoTotal += evento.preco;
      return acc;
    }, { estilos: new Set(), modalidades: new Set(), categorias: new Set(), precoTotal: 0 });

    console.log(`   🎨 ${resumo.estilos.size} estilos diferentes`);
    console.log(`   🎭 ${resumo.modalidades.size} modalidades diferentes`);
    console.log(`   👥 ${resumo.categorias.size} categorias diferentes`);
    console.log(`   💰 Preço médio: R$ ${(resumo.precoTotal / formattedEvents.length).toFixed(2)}`);
    console.log(`   📅 Período: 16 a 18 de Outubro de 2025\n`);

    res.json(formattedEvents);
  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar eventos do festival',
      message: error.message,
      hint: 'Verifique se a migração do banco foi executada corretamente'
    });
  }
};

const getEventsByFilter = async (req, res) => {
  try {
    const { estilo, modalidade, categoria, idadeMin, idadeMax, precoMax } = req.query;
    
    console.log('🔍 Buscando eventos com filtros:', req.query);
    
    let query = supabase
      .from('events')
      .select('*')
      .eq('disponivel', true);
    
    if (estilo) query = query.eq('estilo', estilo);
    if (modalidade) query = query.eq('modalidade', modalidade);
    if (categoria) query = query.eq('categoria', categoria);
    if (idadeMin) query = query.gte('idade_minima', parseInt(idadeMin));
    if (idadeMax) query = query.lte('idade_maxima', parseInt(idadeMax));
    if (precoMax) query = query.lte('preco', parseFloat(precoMax));
    
    query = query.order('preco', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log(`✅ ${data?.length || 0} eventos encontrados com filtros`);
    res.json(data || []);
  } catch (error) {
    console.error('❌ Erro ao filtrar eventos:', error);
    res.status(500).json({ 
      error: 'Erro ao filtrar eventos',
      message: error.message 
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🎯 Buscando evento específico: ${id}`);
    
    const { data: evento, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      throw error;
    }
    
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('modalidades_selecionadas')
      .contains('modalidades_selecionadas', [id])
      .in('status', ['pendente', 'confirmada', 'aprovada']);
    
    const currentRegistrations = registrations?.length || 0;
    const availableSpots = Math.max(0, evento.vagas - currentRegistrations);
    
    res.json({
      ...evento,
      currentRegistrations,
      availableSpots,
      disponivel: evento.disponivel && availableSpots > 0
    });
  } catch (error) {
    console.error('❌ Erro ao buscar evento:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar evento',
      message: error.message 
    });
  }
};

const getFestivalStats = async (req, res) => {
  try {
    console.log('📊 Calculando estatísticas do festival...');
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('estilo, modalidade, categoria, preco, vagas');
    
    if (eventsError) throw eventsError;
    
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('modalidades_selecionadas, total_amount, status')
      .in('status', ['pendente', 'confirmada', 'aprovada']);
    
    if (regError) throw regError;
    
    const stats = {
      totalEventos: events.length,
      estilosUnicos: [...new Set(events.map(e => e.estilo))].length,
      modalidadesUnicas: [...new Set(events.map(e => e.modalidade))].length,
      categoriasUnicas: [...new Set(events.map(e => e.categoria))].length,
      totalVagas: events.reduce((sum, e) => sum + e.vagas, 0),
      menorPreco: Math.min(...events.map(e => e.preco)),
      maiorPreco: Math.max(...events.map(e => e.preco)),
      precoMedio: events.reduce((sum, e) => sum + e.preco, 0) / events.length,
      totalInscricoes: registrations?.length || 0,
      receitaTotal: registrations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
      distribuicaoStatus: registrations?.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}) || {}
    };
    
    console.log('✅ Estatísticas calculadas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro ao calcular estatísticas',
      message: error.message 
    });
  }
};

module.exports = { 
  getEvents, 
  getEventsByFilter, 
  getEventById, 
  getFestivalStats 
};