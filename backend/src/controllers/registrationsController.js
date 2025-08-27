const supabase = require('../config/supabase');

const validateRegistrationData = async (req, res) => {
  try {
    const { documento, email } = req.body;
    
    if (!documento || !email) {
      return res.status(400).json({
        isValid: false,
        conflicts: [],
        message: 'Documento e email são obrigatórios'
      });
    }
    
    const { data: existing, error } = await supabase
      .from('registrations')
      .select('documento, email, status')
      .or(`documento.eq.${documento},email.eq.${email}`)
      .neq('status', 'cancelada');
    
    if (error) {
      throw error;
    }
    
    const conflicts = [];
    
    existing?.forEach(reg => {
      if (reg.documento === documento) {
        conflicts.push({
          type: 'documento',
          value: reg.documento,
          status: reg.status
        });
      }
      if (reg.email === email) {
        conflicts.push({
          type: 'email', 
          value: reg.email,
          status: reg.status
        });
      }
    });
    
    const isValid = conflicts.length === 0;
    
    res.json({
      isValid,
      conflicts,
      message: isValid ? 'Dados válidos' : 'Documento ou email já cadastrados'
    });
  } catch (error) {
    res.status(500).json({
      isValid: false,
      conflicts: [],
      error: 'Erro interno na validação',
      message: error.message
    });
  }
};

const createRegistration = async (req, res) => {
  try {
    const {
      nome,
      documento,
      email,
      celular,
      dataNascimento,
      escola,
      coreografo,
      observacoes,
      modalidadesSelecionadas,
      precoTotal,
      idadeParticipante,
      categoriaParticipante,
      metodoPagamento = 'pendente'
    } = req.body;
    
    const camposObrigatorios = { nome, documento, email, celular, dataNascimento };
    const camposFaltantes = Object.entries(camposObrigatorios)
      .filter(([_, valor]) => !valor)
      .map(([campo, _]) => campo);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios faltando',
        camposFaltantes
      });
    }
    
    if (!modalidadesSelecionadas || modalidadesSelecionadas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Selecione pelo menos uma modalidade'
      });
    }
    
    const { data: eventosValidos, error: eventosError } = await supabase
      .from('events')
      .select('id, titulo, preco, disponivel')
      .in('id', modalidadesSelecionadas);
    
    if (eventosError) throw eventosError;
    
    if (eventosValidos.length !== modalidadesSelecionadas.length) {
      return res.status(400).json({
        success: false,
        error: 'Alguns eventos selecionados não foram encontrados'
      });
    }
    
    const eventosIndisponiveis = eventosValidos.filter(e => !e.disponivel);
    if (eventosIndisponiveis.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Alguns eventos selecionados não estão mais disponíveis',
        eventosIndisponiveis: eventosIndisponiveis.map(e => e.titulo)
      });
    }
    
    const precoCalculado = eventosValidos.reduce((total, evento) => total + evento.preco, 0);
    
    let idade = idadeParticipante;
    if (!idade && dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      idade = hoje.getFullYear() - nascimento.getFullYear();
      if (hoje.getMonth() < nascimento.getMonth() || 
          (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
    }
    
    let categoria = categoriaParticipante;
    if (!categoria && idade) {
      if (idade >= 9 && idade <= 11) categoria = 'PRÉ (9 a 11 anos)';
      else if (idade >= 12 && idade <= 14) categoria = 'JÚNIOR (12 a 14 anos)';
      else if (idade >= 15 && idade <= 19) categoria = 'SENIOR (15 a 19 anos)';
      else if (idade >= 20) categoria = 'AVANÇADO (20+ anos)';
    }
    
    const dadosInscricao = {
      nome: nome.trim(),
      documento: documento.replace(/\D/g, ''),
      email: email.toLowerCase().trim(),
      celular: celular.replace(/\D/g, ''),
      data_nascimento: dataNascimento,
      escola: escola?.trim() || null,
      coreografo: coreografo?.trim() || null,
      observacoes: observacoes?.trim() || null,
      modalidades_selecionadas: modalidadesSelecionadas,
      total_amount: precoCalculado,
      idade_participante: idade,
      categoria_participante: categoria,
      status: 'pendente',
      payment_status: 'pendente',
      payment_method: metodoPagamento,
      created_at: new Date().toISOString()
    };
    
    const { data: inscricao, error: insertError } = await supabase
      .from('registrations')
      .insert([dadosInscricao])
      .select()
      .single();
    
    if (insertError) {
      throw insertError;
    }
    
    const eventosDetalhes = eventosValidos.map(evento => ({
      id: evento.id,
      titulo: evento.titulo,
      preco: evento.preco
    }));
    
    res.status(201).json({
      success: true,
      message: 'Inscrição realizada com sucesso!',
      inscricao: {
        id: inscricao.id,
        nome: inscricao.nome,
        email: inscricao.email,
        status: inscricao.status,
        totalAmount: inscricao.total_amount,
        modalidades: eventosDetalhes,
        proximosPassos: [
          'Aguarde o email de confirmação',
          'Realize o pagamento conforme instruções',
          'Prepare-se para o festival!'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno ao processar inscrição',
      message: error.message
    });
  }
};

const getRegistrations = async (req, res) => {
  try {
    const { status, modalidade, escola, page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('registrations')
      .select(`*, modalidades_selecionadas`)
      .order('created_at', { ascending: false });
    
    if (status && status !== 'todos') {
      query = query.eq('status', status);
    }
    
    if (escola) {
      query = query.ilike('escola', `%${escola}%`);
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    
    const { data: inscricoes, error, count } = await query;
    
    if (error) throw error;
    
    const inscricoesEnriquecidas = await Promise.all(
      (inscricoes || []).map(async (inscricao) => {
        if (!inscricao.modalidades_selecionadas) return inscricao;
        
        const { data: eventos } = await supabase
          .from('events')
          .select('id, titulo, estilo, modalidade, categoria, preco')
          .in('id', inscricao.modalidades_selecionadas);
        
        return {
          ...inscricao,
          modalidadesDetalhes: eventos || []
        };
      })
    );
    
    res.json({
      inscricoes: inscricoesEnriquecidas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar inscrições',
      message: error.message
    });
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes_admin } = req.body;
    
    const statusValidos = ['pendente', 'aprovada', 'confirmada', 'cancelada', 'rejeitada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        error: 'Status inválido',
        statusValidos
      });
    }
    
    const { data: inscricao, error } = await supabase
      .from('registrations')
      .update({
        status,
        observacoes_admin: observacoes_admin || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }
      throw error;
    }
    
    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      inscricao
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao atualizar status',
      message: error.message
    });
  }
};

const getRegistrationStats = async (req, res) => {
  try {
    const { data: inscricoes, error } = await supabase
      .from('registrations')
      .select('status, total_amount, modalidades_selecionadas, escola, idade_participante, categoria_participante');
    
    if (error) throw error;
    
    const stats = {
      totalInscricoes: inscricoes.length,
      distribuicaoStatus: inscricoes.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
      }, {}),
      receitaTotal: inscricoes.reduce((sum, i) => sum + (i.total_amount || 0), 0),
      receitaPorStatus: inscricoes.reduce((acc, i) => {
        if (!acc[i.status]) acc[i.status] = 0;
        acc[i.status] += i.total_amount || 0;
        return acc;
      }, {}),
      distribuicaoIdades: inscricoes.reduce((acc, i) => {
        const categoria = i.categoria_participante || 'Não informado';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {}),
      escolasParticipantes: [...new Set(inscricoes.map(i => i.escola).filter(Boolean))].length,
      mediaModalidadesPorInscricao: inscricoes.reduce((sum, i) => 
        sum + (i.modalidades_selecionadas?.length || 0), 0) / inscricoes.length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao calcular estatísticas',
      message: error.message
    });
  }
};

module.exports = {
  validateRegistrationData,
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
  getRegistrationStats
};
