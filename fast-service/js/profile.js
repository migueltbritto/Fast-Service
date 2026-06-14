(function () {
    const container = document.getElementById('profile-container');

    // ── Carregar usuário ──────────────────────────────────────────────────────

    const raw = sessionStorage.getItem('loggedUser');

    if (!raw) {
        container.innerHTML = `
            <div class="profile-no-login">
                <h2>Você precisa estar logado para ver seu perfil.</h2>
                <a href="select-account.html">Fazer login</a>
            </div>`;
        return;
    }

    const sessionUser = JSON.parse(raw);
    const allUsers = JSON.parse(localStorage.getItem('fastservice_users') || '[]');
    let user = allUsers.find(u => u.email === sessionUser.email) || sessionUser;

    function persistUser(updates) {
        Object.assign(user, updates);
        const idx = allUsers.findIndex(u => u.email === user.email);
        if (idx !== -1) allUsers[idx] = user;
        localStorage.setItem('fastservice_users', JSON.stringify(allUsers));
        sessionStorage.setItem('loggedUser', JSON.stringify(user));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function fmtDate(str) {
        if (!str) return '—';
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
    }

    const typeLabels = {
        user: 'Usuário',
        professional: 'Profissional',
        enterprise: 'Empresa'
    };

    function infoRow(label, value) {
        return `
        <div class="info-row">
            <span class="info-label">${label}</span>
            <span class="info-value">${value || '—'}</span>
        </div>`;
    }

    // ── Renderização ─────────────────────────────────────────────────────────

    function renderInfoRows() {
        if (user.type === 'enterprise') {
            return [
                infoRow('Razão Social', user.socialReason),
                infoRow('Representante', user.agentName),
                infoRow('Email', user.email),
                infoRow('CNPJ', user.cnpj),
                infoRow('Telefone', user.phone),
                infoRow('Cidade', `${user.city} — ${user.uf}`),
            ].join('');
        }
        return [
            infoRow('Nome', user.name),
            infoRow('Email', user.email),
            infoRow('CPF', user.cpf),
            infoRow('Telefone', user.phone),
            infoRow('Nascimento', fmtDate(user.date)),
            user.serviceArea ? infoRow('Área de atuação', user.serviceArea) : '',
            infoRow('Cidade', `${user.city} — ${user.uf}`),
            infoRow('Gênero', user.sex),
        ].join('');
    }

    function renderPortfolioItems() {
        const items = user.portfolio || [];
        if (!items.length) {
            return '<p class="portfolio-empty">Nenhum trabalho adicionado ainda.</p>';
        }
        return items.map((item, i) => `
            <div class="portfolio-card">
                ${item.photo ? `<img src="${item.photo}" alt="Trabalho ${i + 1}">` : ''}
                ${item.description ? `<p>${item.description}</p>` : ''}
                <button class="portfolio-remove" data-index="${i}">Remover</button>
            </div>`
        ).join('');
    }

    function render() {
        const displayName = user.type === 'enterprise' ? user.socialReason : user.name;
        const initial = (displayName?.[0] ?? '?').toUpperCase();
        const typeLabel = typeLabels[user.type] || user.type;
        const isPro = user.type === 'professional';
        const hasDesc = user.type !== 'user';
        const desc = user.description || '';

        container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">${initial}</div>
            <div class="profile-header-info">
                <h1>${displayName}</h1>
                <span class="profile-badge profile-badge--${user.type}">${typeLabel}</span>
                ${user.serviceArea ? `<p class="profile-service-area">${user.serviceArea}</p>` : ''}
            </div>
        </div>

        <div class="profile-body ${hasDesc ? '' : 'profile-body--single'}">
            <section class="profile-card">
                <h2>Informações</h2>
                <div class="profile-info-grid">${renderInfoRows()}</div>
            </section>

            ${hasDesc ? `
            <section class="profile-card">
                <h2>Descrição do perfil</h2>
                <textarea id="profile-desc" maxlength="1000"
                    placeholder="Conte sobre você, seus serviços e experiências...">${desc}</textarea>
                <div class="desc-footer">
                    <span id="desc-count">${desc.length}/1000</span>
                    <button id="desc-save">Salvar</button>
                </div>
            </section>` : ''}
        </div>

        ${isPro ? `
        <section class="profile-portfolio">
            <div class="portfolio-header">
                <h2>Trabalhos realizados</h2>
                <button id="btn-add-work">+ Adicionar trabalho</button>
            </div>
            <div class="portfolio-grid" id="portfolio-grid">
                ${renderPortfolioItems()}
            </div>
        </section>` : ''}`;

        if (hasDesc) wireDescription();
        if (isPro) wirePortfolio();
    }

    // ── Descrição ─────────────────────────────────────────────────────────────

    function wireDescription() {
        const textarea = document.getElementById('profile-desc');
        const counter  = document.getElementById('desc-count');
        const saveBtn  = document.getElementById('desc-save');

        textarea.addEventListener('input', () => {
            counter.textContent = `${textarea.value.length}/1000`;
        });

        saveBtn.addEventListener('click', () => {
            persistUser({ description: textarea.value });
            saveBtn.textContent = 'Salvo!';
            setTimeout(() => { saveBtn.textContent = 'Salvar'; }, 2000);
        });
    }

    // ── Portfólio ─────────────────────────────────────────────────────────────

    function wirePortfolio() {
        document.getElementById('btn-add-work').addEventListener('click', openModal);

        document.getElementById('portfolio-grid').addEventListener('click', e => {
            const btn = e.target.closest('.portfolio-remove');
            if (!btn) return;
            const idx = parseInt(btn.dataset.index);
            const portfolio = [...(user.portfolio || [])];
            portfolio.splice(idx, 1);
            persistUser({ portfolio });
            document.getElementById('portfolio-grid').innerHTML = renderPortfolioItems();
        });
    }

    // ── Modal ─────────────────────────────────────────────────────────────────

    let pendingPhoto = null;
    const modal         = document.getElementById('portfolio-modal');
    const photoInput    = document.getElementById('portfolio-photo');
    const preview       = document.getElementById('portfolio-preview');
    const descInput     = document.getElementById('portfolio-desc');
    const descCount     = document.getElementById('portfolio-desc-count');

    function openModal() {
        pendingPhoto = null;
        photoInput.value = '';
        descInput.value = '';
        descCount.textContent = '0/300';
        preview.style.display = 'none';
        preview.src = '';
        document.getElementById('file-name').textContent = 'Nenhum arquivo selecionado';
        modal.classList.add('open');
    }

    function closeModal() {
        modal.classList.remove('open');
    }

    document.getElementById('modal-fechar').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (!file) return;
        document.getElementById('file-name').textContent = file.name;
        const reader = new FileReader();
        reader.onload = ev => {
            pendingPhoto = ev.target.result;
            preview.src = pendingPhoto;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    descInput.addEventListener('input', () => {
        descCount.textContent = `${descInput.value.length}/300`;
    });

    document.getElementById('portfolio-save').addEventListener('click', () => {
        const desc = descInput.value.trim();
        if (!pendingPhoto && !desc) {
            alert('Adicione uma foto ou uma descrição antes de salvar.');
            return;
        }
        const portfolio = [...(user.portfolio || [])];
        portfolio.push({ photo: pendingPhoto || '', description: desc });
        persistUser({ portfolio });
        document.getElementById('portfolio-grid').innerHTML = renderPortfolioItems();
        closeModal();
    });

    // ── Init ──────────────────────────────────────────────────────────────────

    render();
})();
