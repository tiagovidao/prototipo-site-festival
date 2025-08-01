const supabase = require('../config/supabase');

const createContact = async (req, res) => {
  try {
    console.log('Dados de contato recebidos:', req.body);
    
    const { nome, email, telefone, cidade, escola, mensagem } = req.body;

    if (!nome || !mensagem) {
      return res.status(400).json({ 
        error: 'Nome e mensagem são obrigatórios',
        received: req.body
      });
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ 
        nome: nome.trim(),
        email: email?.trim() || null,
        telefone: telefone?.trim() || null,
        cidade: cidade?.trim() || null,
        escola: escola?.trim() || null,
        mensagem: mensagem.trim()
      }])
      .select();

    if (error) {
      console.error('Erro do Supabase:', error);
      throw error;
    }

    console.log('✅ Contato criado:', data[0]);

    res.status(201).json({ 
      message: 'Mensagem enviada com sucesso!',
      data: data[0]
    });
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).json({ 
      error: 'Erro ao processar contato',
      message: error.message 
    });
  }
};

module.exports = { createContact };