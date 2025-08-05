// 🚀 AUTO-DETECÇÃO DE AMBIENTE
const API_BASE = (() => {
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.port === '3001';
    
    if (isLocal) {
        return 'http://localhost:3001/api';
    } else {
        // ⚠️ ALTERE APENAS ESTA LINHA COM A URL DO SEU BACKEND EM PRODUÇÃO
        return 'https://festival-admin.netlify.app/api';
    }
})();

let authHeader = '', dashboardData = null, autoRefreshInterval = null;

const showLoading = () => document.getElementById('loading-overlay').style.display = 'flex';
const hideLoading = () => document.getElementById('loading-overlay').style.display = 'none';
const formatCurrency = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = dateString => new Date(dateString).toLocaleString('pt-BR');

function showNotification(message, type = 'info') {
    const colors = { success: '#28a745', error: '#dc3545', info: '#007bff', warning: '#ffc107' };
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.backgroundColor = colors[type];
    notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3500);
}

const togglePassword = () => {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordIcon.className = `fas fa-eye${passwordInput.type === 'password' ? '' : '-slash'}`;
};

const login = async (event) => {
    event.preventDefault();
    showLoading();
    authHeader = 'Basic ' + btoa(document.getElementById('username').value + ':' + document.getElementById('password').value);
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard`, { 
            headers: { 'Authorization': authHeader },
            mode: 'cors' // Importante para CORS
        });
        if (!response.ok) throw new Error('Credenciais inválidas');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        await loadDashboard();
        startAutoRefresh();
        showNotification('Login realizado com sucesso!', 'success');
    } catch (error) {
        showNotification(`Erro ao fazer login: ${error.message}`, 'error');
        authHeader = '';
    } finally {
        hideLoading();
    }
};

const logout = () => {
    authHeader = '';
    dashboardData = null;
    stopAutoRefresh();
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    showNotification('Logout realizado com sucesso!', 'info');
};

const loadDashboard = async () => {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/admin/dashboard`, { 
            headers: { 'Authorization': authHeader },
            mode: 'cors'
        });
        if (!response.ok) throw new Error('Erro ao carregar dados');
        dashboardData = await response.json();
        renderStats(dashboardData.stats);
        renderEvents(dashboardData.events);
        renderRecentRegistrations(dashboardData.recentRegistrations);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dados do dashboard', 'error');
    } finally {
        hideLoading();
    }
};

const refreshDashboard = async () => {
    showNotification('Atualizando dados...', 'info');
    await loadDashboard();
};

const startAutoRefresh = () => {
    const updateTime = () => document.getElementById('current-time').textContent = new Date().toLocaleTimeString('pt-BR');
    updateTime();
    setInterval(updateTime, 1000);
    autoRefreshInterval = setInterval(loadDashboard, 10 * 60 * 1000);
};

const stopAutoRefresh = () => {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
};

const renderStats = stats => {
    const occupancyRate = stats.totalEvents > 0 ? (stats.totalRegistrations / (stats.totalEvents * 7) * 100).toFixed(1) : 0;
    document.getElementById('stats-grid').innerHTML = `
        <div><p>Total de Eventos</p><p style="color:var(--blue);">${stats.totalEvents}</p></div>
        <div><p>Inscrições Confirmadas</p><p style="color:var(--green);">${stats.totalRegistrations}</p></div>
        <div><p>Receita Total</p><p style="color:var(--blue);">${formatCurrency(stats.totalRevenue)}</p></div>
        <div><p>Pendentes</p><p style="color:var(--red);">${stats.pendingRegistrations}</p></div>`;
};

const renderEvents = events => {
    document.getElementById('events-list').innerHTML = events.map(event => {
        const occupancyRate = (event.currentRegistrations / event.total_vacancies) * 100;
        const statusColor = event.availableSpots > 2 ? 'green' : event.availableSpots > 0 ? 'yellow' : 'red';
        const progressColor = occupancyRate >= 100 ? 'red' : occupancyRate >= 80 ? 'yellow' : 'green';
        return `<div><h3>${event.title} <span class="status-${statusColor}">${event.availableSpots > 0 ? 'Disponível' : 'Esgotado'}</span></h3>
            <p><i class="fas fa-user-tie"></i> ${event.instructor} | <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString('pt-BR')} | <i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p><strong>${event.currentRegistrations}</strong> Inscrições | <strong>${event.availableSpots}</strong> Vagas Restantes | <strong>${occupancyRate.toFixed(0)}%</strong> Ocupação</p>
            <div class="progress-bar"><div class="progress-${progressColor}" style="width:${Math.min(occupancyRate, 100)}%"></div></div>
            ${event.registrations?.length > 0 ? `<details><summary>Ver Inscritos (${event.registrations.length})</summary><div>${event.registrations.map(reg => `<p><strong>${reg.nome}</strong> (${reg.email})</p>`).join('')}</div></details>` : '<p class="no-registrations">Nenhuma inscrição ainda</p>'}
        </div>`;
    }).join('');
};

const renderRecentRegistrations = registrations => {
    const container = document.getElementById('recent-registrations');
    if (!registrations || registrations.length === 0) {
        container.innerHTML = `<div class="no-registrations"><i class="fas fa-inbox"></i><p>Nenhuma inscrição encontrada</p></div>`;
        return;
    }
    container.innerHTML = `<div class="table-container"><table><thead><tr><th>Participante</th><th>Contato</th><th>Eventos</th><th>Valor</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>${registrations.map(reg => {
            const statusClass = `status-${reg.status}`;
            return `<tr>
                <td><div class="avatar">${reg.nome.charAt(0).toUpperCase()}</div><div><strong>${reg.nome}</strong><br>${reg.documento}</div></td>
                <td>${reg.email}<br>${reg.celular || 'N/A'}</td>
                <td>${reg.selected_events.length} evento(s)</td>
                <td>${formatCurrency(reg.total_amount)}</td>
                <td>${formatDate(reg.created_at)}</td>
                <td><select class="${statusClass}" data-registration-id="${reg.id}"><option value="confirmada" ${reg.status === 'confirmada' ? 'selected' : ''}>Confirmada</option><option value="pendente" ${reg.status === 'pendente' ? 'selected' : ''}>Pendente</option><option value="cancelada" ${reg.status === 'cancelada' ? 'selected' : ''}>Cancelada</option></select></td>
                <td><div class="actions"><button data-action="view" data-registration-id="${reg.id}" title="Ver"><i class="fas fa-eye"></i></button><button data-action="email" data-email="${reg.email}" title="Email"><i class="fas fa-envelope"></i></button><button data-action="delete" data-registration-id="${reg.id}" title="Excluir"><i class="fas fa-trash"></i></button></div></td>
            </tr>`;
        }).join('')}</tbody></table></div>`;

    container.querySelectorAll('select[data-registration-id]').forEach(s => s.addEventListener('change', e => updateStatus(e.target.dataset.registrationId, e.target.value)));
    container.querySelectorAll('button[data-action]').forEach(b => b.addEventListener('click', e => {
        const target = e.currentTarget;
        const action = target.dataset.action;
        if (action === 'view') viewRegistrationDetails(target.dataset.registrationId);
        if (action === 'email') sendEmail(target.dataset.email);
        if (action === 'delete') deleteRegistration(target.dataset.registrationId);
    }));
};

async function updateStatus(registrationId, newStatus) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/admin/registrations/${registrationId}/status`, { 
            method: 'PUT', 
            headers: { 
                'Authorization': authHeader, 
                'Content-Type': 'application/json' 
            }, 
            body: JSON.stringify({ status: newStatus }),
            mode: 'cors'
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        showNotification('Status atualizado com sucesso!', 'success');
        await loadDashboard();
    } catch (error) {
        showNotification('Erro ao atualizar status', 'error');
    } finally {
        hideLoading();
    }
}

const filterRegistrations = () => {
    const filter = document.getElementById('statusFilter').value;
    if (!dashboardData) return;
    const filtered = filter === 'all' ? dashboardData.recentRegistrations : dashboardData.recentRegistrations.filter(reg => reg.status === filter);
    renderRecentRegistrations(filtered);
};

const viewRegistrationDetails = registrationId => {
    const reg = dashboardData.recentRegistrations.find(r => r.id === registrationId);
    if (!reg) return;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-content"><div class="modal-header"><h3>Detalhes da Inscrição</h3><button id="closeModalBtn"><i class="fas fa-times"></i></button></div>
        <div class="modal-body">
            <p><strong>Nome:</strong> ${reg.nome}</p><p><strong>Documento:</strong> ${reg.documento}</p>
            <p><strong>Email:</strong> ${reg.email}</p><p><strong>Celular:</strong> ${reg.celular || 'N/A'}</p>
            <p><strong>Valor:</strong> ${formatCurrency(reg.total_amount)}</p><p><strong>Data:</strong> ${formatDate(reg.created_at)}</p>
            <p><strong>Status:</strong> ${reg.status}</p>
            <p><strong>Eventos:</strong> ${reg.selected_events.map(id => dashboardData.events.find(e => e.id === id)?.title || id).join(', ')}</p>
        </div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#closeModalBtn').addEventListener('click', () => modal.remove());
};

const sendEmail = email => window.location.href = `mailto:${email}?subject=Festival de Ballet 2025`;
const deleteRegistration = () => showNotification('Funcionalidade de exclusão em desenvolvimento.', 'warning');
const showHelp = () => document.getElementById('help-modal').style.display = 'flex';
const closeHelp = () => document.getElementById('help-modal').style.display = 'none';

const exportData = () => {
    if (!dashboardData) return;
    const csvContent = ['Nome,Documento,Email,Status,Valor,Data Inscrição', ...dashboardData.recentRegistrations.map(r => `"${r.nome}","${r.documento}","${r.email}","${r.status}",${r.total_amount},"${formatDate(r.created_at)}"`)] .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `festival-ballet-inscricoes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('Dados exportados!', 'success');
};

const handleKeyboardShortcuts = e => {
    if (e.ctrlKey || e.metaKey) {
        const actions = { 'r': refreshDashboard, 'e': exportData, '?': showHelp };
        if (actions[e.key]) {
            e.preventDefault();
            actions[e.key]();
        }
    }
    if (e.key === 'Escape') closeHelp();
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('password').focus();
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('togglePasswordButton').addEventListener('click', togglePassword);
    document.getElementById('refreshDashboardButton').addEventListener('click', refreshDashboard);
    document.getElementById('exportDataButton').addEventListener('click', exportData);
    document.getElementById('showHelpButton').addEventListener('click', showHelp);
    document.getElementById('closeHelpButton').addEventListener('click', closeHelp);
    document.getElementById('statusFilter').addEventListener('change', filterRegistrations);
    document.addEventListener('keydown', handleKeyboardShortcuts);
});