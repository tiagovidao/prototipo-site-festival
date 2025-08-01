const supabase = require('../config/supabase');

const createDonation = async (req, res) => {
  try {
    console.log('Dados de doação recebidos:', req.body);
    
    const { nome, email, comprovantes } = req.body;

    if (!nome || !email || !comprovantes?.length) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios',
        received: req.body
      });
    }

    const { data, error } = await supabase
      .from('donations')
      .insert([{ 
        nome: nome.trim(),
        email: email.trim(),
        comprovantes: comprovantes,
        status: 'pending'
      }])
      .select();

    if (error) {
      console.error('Erro do Supabase:', error);
      throw error;
    }

    console.log('✅ Doação criada:', data[0]);

    res.status(201).json({ 
      message: 'Doação registrada com sucesso!',
      data: data[0]
    });
  } catch (error) {
    console.error('Erro ao criar doação:', error);
    res.status(500).json({ 
      error: 'Erro ao processar doação',
      message: error.message 
    });
  }
};

module.exports = { createDonation };