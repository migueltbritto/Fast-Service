document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login')) {
        initLoginPage();
    } else if (document.getElementById('cadastro')) {
        initCadastroPage();
    } else if (document.querySelector('.buttom-select-form')) {
        initSelectPage();
    }
});

// === SELECT ACCOUNT PAGE ===

function initSelectPage() {
    document.querySelectorAll('.buttom-select-form').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            sessionStorage.setItem('accountType', btn.dataset.type);
            window.location.href = 'forms/login_form.html';
        });
    });
}

// === LOGIN PAGE ===

function initLoginPage() {
    const type = sessionStorage.getItem('accountType') || 'user';

    const titles = {
        user: 'Login - Usuário',
        professional: 'Login - Profissional',
        enterprise: 'Login - Empresa'
    };
    const h1 = document.querySelector('#login h1');
    if (h1) h1.textContent = titles[type] || 'Login';

    const registerLinks = {
        user: 'user_register_form.html',
        professional: 'professional_register_form.html',
        enterprise: 'enterprise_register_form.html'
    };
    const criarContaLink = document.getElementById('criar-conta-link');
    if (criarContaLink) criarContaLink.href = registerLinks[type] || registerLinks.user;

    document.getElementById('login').addEventListener('submit', handleLogin);
}

function handleLogin(e) {
    e.preventDefault();

    const prevError = document.getElementById('login-error');
    if (prevError) prevError.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showLoginError('Preencha todos os campos');
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        sessionStorage.setItem('loggedUser', JSON.stringify(user));
        window.location.href = '../home-page.html';
    } else {
        showLoginError('Email ou senha incorretos');
    }
}

// === CADASTRO PAGE ===

function initCadastroPage() {
    const path = window.location.pathname;
    let formType;
    if (path.includes('professional')) formType = 'professional';
    else if (path.includes('enterprise')) formType = 'enterprise';
    else formType = 'user';

    applyMasks();

    document.querySelectorAll('#cadastro input, #cadastro select').forEach(el => {
        el.addEventListener('input', () => clearFieldError(el.id));
        el.addEventListener('change', () => clearFieldError(el.id));
    });

    document.getElementById('cadastro').addEventListener('submit', e => handleCadastro(e, formType));
}

function applyMasks() {
    const cpf = document.getElementById('cpf');
    const cnpj = document.getElementById('CNPJ');
    const phone = document.getElementById('phone');

    if (cpf) cpf.addEventListener('input', () => maskCPF(cpf));
    if (cnpj) cnpj.addEventListener('input', () => maskCNPJ(cnpj));
    if (phone) phone.addEventListener('input', () => maskPhone(phone));
}

function handleCadastro(e, type) {
    e.preventDefault();
    if (!validateForm(type)) return;

    const data = collectFormData(type);
    const users = getUsers();

    if (users.find(u => u.email === data.email)) {
        showFieldError('email', 'Este email já está cadastrado');
        return;
    }

    users.push(data);
    saveUsers(users);

    sessionStorage.setItem('accountType', type);
    window.location.href = 'login_form.html';
}

function validateForm(type) {
    clearErrors();
    let valid = true;

    const email = document.getElementById('email').value.trim();
    if (!isValidEmail(email)) {
        showFieldError('email', 'Insira um email válido');
        valid = false;
    }

    const password = document.getElementById('password').value;
    if (password.length < 6) {
        showFieldError('password', 'A senha deve ter pelo menos 6 caracteres');
        valid = false;
    }

    const passwordConfirm = document.getElementById('password_confirm').value;
    if (password !== passwordConfirm) {
        showFieldError('password_confirm', 'As senhas não coincidem');
        valid = false;
    }

    if (type === 'enterprise') {
        valid = validateEnterpriseFields() && valid;
    } else {
        valid = validateCommonFields() && valid;
        if (type === 'professional') {
            const serviceArea = document.getElementById('serviceArea').value.trim();
            if (!serviceArea) {
                showFieldError('serviceArea', 'Área de atuação obrigatória');
                valid = false;
            }
        }
    }

    return valid;
}

function validateCommonFields() {
    let valid = true;

    const name = document.getElementById('name').value.trim();
    if (!name) { showFieldError('name', 'Nome obrigatório'); valid = false; }

    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    if (cpf.length !== 11) { showFieldError('cpf', 'CPF deve ter 11 dígitos'); valid = false; }

    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    if (phone.length < 10) { showFieldError('phone', 'Telefone inválido'); valid = false; }

    if (!document.getElementById('date').value) {
        showFieldError('date', 'Data de nascimento obrigatória');
        valid = false;
    }

    const city = document.getElementById('city').value.trim();
    if (!city) { showFieldError('city', 'Cidade obrigatória'); valid = false; }

    if (!document.getElementById('uf').value) {
        showFieldError('uf', 'Selecione o estado');
        valid = false;
    }

    return valid;
}

function validateEnterpriseFields() {
    let valid = true;

    const socialReason = document.getElementById('socialReason').value.trim();
    if (!socialReason) { showFieldError('socialReason', 'Razão social obrigatória'); valid = false; }

    const agentName = document.getElementById('agentName').value.trim();
    if (!agentName) { showFieldError('agentName', 'Nome do representante obrigatório'); valid = false; }

    const cnpj = document.getElementById('CNPJ').value.replace(/\D/g, '');
    if (cnpj.length !== 14) { showFieldError('CNPJ', 'CNPJ deve ter 14 dígitos'); valid = false; }

    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    if (phone.length < 10) { showFieldError('phone', 'Telefone inválido'); valid = false; }

    const city = document.getElementById('city').value.trim();
    if (!city) { showFieldError('city', 'Cidade obrigatória'); valid = false; }

    if (!document.getElementById('uf').value) {
        showFieldError('uf', 'Selecione o estado');
        valid = false;
    }

    return valid;
}

function collectFormData(type) {
    const base = {
        type,
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };

    if (type === 'enterprise') {
        return Object.assign(base, {
            socialReason: document.getElementById('socialReason').value.trim(),
            agentName: document.getElementById('agentName').value.trim(),
            cnpj: document.getElementById('CNPJ').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value.trim(),
            uf: document.getElementById('uf').value
        });
    }

    const data = Object.assign(base, {
        name: document.getElementById('name').value.trim(),
        cpf: document.getElementById('cpf').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        city: document.getElementById('city').value.trim(),
        uf: document.getElementById('uf').value,
        sex: document.getElementById('sex').value
    });

    if (type === 'professional') {
        data.serviceArea = document.getElementById('serviceArea').value.trim();
    }

    return data;
}

// === LOCALSTORAGE ===

function getUsers() {
    return JSON.parse(localStorage.getItem('fastservice_users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('fastservice_users', JSON.stringify(users));
}

// === ERROR HELPERS ===

function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#e00';
    const campo = el.closest('.campo');
    if (!campo) return;
    const errEl = campo.querySelector('a');
    if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = 'block';
        errEl.style.color = '#e00';
        errEl.style.fontSize = '12px';
    }
}

function clearFieldError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '';
    const campo = el.closest('.campo');
    if (!campo) return;
    const errEl = campo.querySelector('a');
    if (errEl) errEl.style.display = 'none';
}

function clearErrors() {
    document.querySelectorAll('.campo a').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    document.querySelectorAll('#cadastro input, #cadastro select').forEach(el => {
        el.style.borderColor = '';
    });
}

function showLoginError(msg) {
    let el = document.getElementById('login-error');
    if (!el) {
        el = document.createElement('p');
        el.id = 'login-error';
        el.style.cssText = 'color:#e00;font-size:14px;text-align:center;margin:0;';
        const btn = document.querySelector('#login button');
        btn.insertAdjacentElement('beforebegin', el);
    }
    el.textContent = msg;
}

// === MASKS ===

function maskCPF(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

function maskCNPJ(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 14);
    v = v.replace(/(\d{2})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1/$2');
    v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

function maskPhone(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 10) {
        v = v.replace(/(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    } else {
        v = v.replace(/(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
    input.value = v;
}

// === UTILS ===

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
