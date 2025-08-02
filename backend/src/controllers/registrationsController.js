const supabase = require('../config/supabase');

const createRegistration = async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    
    const { 
      nome, 
      documento, 
      email, 
      celular, 
      dataNascimento, 
      selectedEvents, 
      totalAmount 
    } = req.body;

    // Validação básica
    if (!nome || !documento || !email || !celular || !dataNascimento || !selectedEvents?.length) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios',
        received: req.body
      });
    }

    // Verificar se já existe uma inscrição com mesmo documento ou email
    const { data: existingRegistration } = await supabase
      .from('registrations')
      .select('id, documento, email')
      .or(`documento.eq.${documento.trim()},email.eq.${email.trim()}`)
      .single();

    if (existingRegistration) {
      return res.status(409).json({
        error: 'Já existe uma inscrição com este documento ou email',
        conflict: existingRegistration.documento === documento.trim() ? 'documento' : 'email'
      });
    }

    // Verificar disponibilidade de vagas para cada evento selecionado
    for (const eventId of selectedEvents) {
      // Buscar informações do evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return res.status(400).json({
          error: `Evento ${eventId} não encontrado`
        });
      }

      if (!event.available) {
        return res.status(400).json({
          error: `Evento ${event.title} não está disponível para inscrição`
        });
      }

      // Contar inscrições atuais para este evento
      const { data: currentRegistrations, error: countError } = await supabase
        .from('registrations')
        .select('selected_events')
        .eq('status', 'confirmada');

      if (countError) {
        throw countError;
      }

      const eventCount = currentRegistrations?.reduce((count, reg) => {
        return count + (reg.selected_events?.includes(eventId) ? 1 : 0);
      }, 0) || 0;

      const availableSpots = event.total_vacancies - eventCount;

      if (availableSpots <= 0) {
        return res.status(409).json({
          error: `Evento ${event.title} está esgotado`,
          eventId: eventId,
          availableSpots: 0
        });
      }
    }

    // Se chegou até aqui, todas as verificações passaram - criar a inscrição
    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        nome: nome.trim(),
        documento: documento.trim(),
        email: email.trim(),
        celular: celular.trim(),
        data_nascimento: dataNascimento,
        selected_events: selectedEvents,
        total_amount: totalAmount || 0,
        status: 'confirmada'
      }])
      .select();

    if (error) {
      console.error('Erro do Supabase:', error);
      throw error;
    }

    console.log('✅ Inscrição criada:', data[0]);

    res.status(201).json({ 
      message: 'Inscrição realizada com sucesso!',
      data: data[0]
    });
  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    res.status(500).json({ 
      error: 'Erro ao processar inscrição',
      message: error.message 
    });
  }
};

const getRegistrations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar inscrições',
      message: error.message 
    });
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmada', 'cancelada', 'pendente'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido. Use: confirmada, cancelada ou pendente'
      });
    }

    const { data, error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Status atualizado com sucesso',
      data: data[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar status',
      message: error.message 
    });
  }
};

module.exports = { 
  createRegistration, 
  getRegistrations, 
  updateRegistrationStatus 
};

