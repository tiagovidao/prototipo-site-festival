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

    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        nome: nome.trim(),
        documento: documento.trim(),
        email: email.trim(),
        celular: celular.trim(),
        data_nascimento: dataNascimento,
        selected_events: selectedEvents,
        total_amount: totalAmount || 0
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

module.exports = { createRegistration };