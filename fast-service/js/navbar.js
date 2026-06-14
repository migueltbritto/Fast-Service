(function () {
    const isInForms = window.location.pathname.includes('/forms/');
    const base = isInForms ? '../' : '';

    // Aplica dark mode antes de renderizar qualquer coisa (evita flash)
    if (localStorage.getItem('darkMode') === 'on') {
        document.documentElement.classList.add('dark-mode');
    }

    // Aplica tamanho de fonte salvo antes de renderizar (evita flash)
    const savedFontSize = parseInt(localStorage.getItem('fontSize') || '0');
    document.documentElement.setAttribute('data-font-size', savedFontSize);

    // Injeta dark-mode.css
    const linkDark = document.createElement('link');
    linkDark.rel = 'stylesheet';
    linkDark.href = `${base}css/dark-mode.css`;
    document.head.appendChild(linkDark);

    // Injeta accessibility.css
    const linkA11y = document.createElement('link');
    linkA11y.rel = 'stylesheet';
    linkA11y.href = `${base}css/accessibility.css`;
    document.head.appendChild(linkA11y);

    const style = document.createElement('style');
    style.textContent = `
        .dark-toggle {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 8px;
            line-height: 1;
            transition: background 0.2s;
        }
        .dark-toggle:hover { background: rgba(0, 0, 0, 0.1); }
        html.dark-mode .dark-toggle:hover { background: rgba(255, 255, 255, 0.1); }

        .font-controls {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .font-btn {
            background: none;
            border: 1px solid rgba(0, 0, 0, 0.25);
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            padding: 3px 7px;
            border-radius: 6px;
            line-height: 1;
            transition: background 0.2s, opacity 0.2s;
            color: inherit;
        }
        .font-btn:hover:not(:disabled) { background: rgba(0, 0, 0, 0.1); }
        .font-btn:disabled { opacity: 0.3; cursor: default; }
        html.dark-mode .font-btn { border-color: rgba(255, 255, 255, 0.25); }
        html.dark-mode .font-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }

        .logout-btn {
            background: none;
            border: 1px solid rgba(0, 0, 0, 0.25);
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            padding: 4px 10px;
            border-radius: 6px;
            color: #c00;
            transition: background 0.2s, color 0.2s;
        }
        .logout-btn:hover { background: #c00; color: white; border-color: #c00; }
        html.dark-mode .logout-btn { border-color: rgba(255,255,255,0.25); color: #ff6b6b; }
        html.dark-mode .logout-btn:hover { background: #c00; color: white; border-color: #c00; }

        /* ── Botão de opções (visível apenas em tablet/celular via CSS) ── */
        .settings-btn {
            display: none;
            background: none;
            border: none;
            font-size: 22px;
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 8px;
            line-height: 1;
            transition: background 0.2s;
        }
        .settings-btn:hover { background: rgba(0, 0, 0, 0.1); }
        html.dark-mode .settings-btn:hover { background: rgba(255, 255, 255, 0.1); }

        /* ── Painel de opções (bottom sheet) ── */
        .settings-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1001;
            align-items: flex-end;
            justify-content: center;
        }
        .settings-overlay.open { display: flex; }

        .settings-panel {
            background: white;
            border-radius: 20px 20px 0 0;
            width: 100%;
            max-width: 540px;
            overflow: hidden;
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.18);
        }

        .settings-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 20px 14px;
            border-bottom: 1px solid #eee;
        }
        .settings-panel-header span {
            font-size: 16px;
            font-weight: bold;
            color: #1a1a1a;
        }

        .settings-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            line-height: 1;
            padding: 0 4px;
            transition: color 0.2s;
        }
        .settings-close:hover { color: #000; }

        .settings-panel-body {
            padding: 4px 20px 32px;
            display: flex;
            flex-direction: column;
        }

        .settings-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .settings-item:last-child { border-bottom: none; }

        .settings-item-label {
            font-size: 15px;
            color: #333;
            font-weight: 500;
        }

        .settings-item .font-controls { gap: 8px; }
        .settings-item .font-btn {
            font-size: 14px;
            padding: 5px 12px;
        }
        .settings-item .dark-toggle { font-size: 24px; }
        .settings-item .logout-btn {
            font-size: 14px;
            padding: 8px 20px;
        }

        /* Dark mode — painel */
        html.dark-mode .settings-panel { background: #1e1e1e; }
        html.dark-mode .settings-panel-header { border-color: #2a2a2a; }
        html.dark-mode .settings-panel-header span { color: #e0e0e0; }
        html.dark-mode .settings-close { color: #aaa; }
        html.dark-mode .settings-close:hover { color: #fff; }
        html.dark-mode .settings-item { border-color: #2a2a2a; }
        html.dark-mode .settings-item-label { color: #e0e0e0; }
    `;
    document.head.appendChild(style);

    const isDark = document.documentElement.classList.contains('dark-mode');
    const isLoggedIn = !!sessionStorage.getItem('loggedUser');
    const userHref = isLoggedIn ? `${base}profile.html` : `${base}select-account.html`;

    const html = `
    <header class="navbar">
        <div class="inicio">
            <img src="${base}img/back-removebg-preview.png" alt="Fast Service" width="500">
        </div>
        <nav>
            <img src="${base}img/logo-fastservice-removebg-preview.png" alt="Logo do site" class="logo">
            <ul class="menu">
                <li><a href="${base}home-page.html">HOME</a></li>
                <li><a href="${base}professionals-page.html">PROFISSIONAIS</a></li>
            </ul>
            <div class="user-area">
                <div class="font-controls">
                    <button class="font-btn" id="font-decrease" title="Diminuir fonte">A-</button>
                    <button class="font-btn" id="font-increase" title="Aumentar fonte">A+</button>
                </div>
                <button class="dark-toggle" id="dark-toggle" title="Alternar modo escuro">${isDark ? '☀️' : '🌙'}</button>
                <a href="${userHref}">
                    <img src="${base}img/user.png" alt="" class="users" id="userIcon">
                </a>
                ${isLoggedIn ? `<button class="logout-btn" id="logout-btn" title="Sair da conta">Sair</button>` : ''}
                <button class="settings-btn" id="settings-btn" title="Opções">⚙️</button>
            </div>
        </nav>
    </header>

    <div id="settings-overlay" class="settings-overlay">
        <div class="settings-panel">
            <div class="settings-panel-header">
                <span>Opções</span>
                <button id="settings-close" class="settings-close">&times;</button>
            </div>
            <div class="settings-panel-body">
                <div class="settings-item">
                    <span class="settings-item-label">Modo escuro</span>
                    <button class="dark-toggle" id="dark-toggle-panel" title="Alternar modo escuro">${isDark ? '☀️' : '🌙'}</button>
                </div>
                <div class="settings-item">
                    <span class="settings-item-label">Tamanho da fonte</span>
                    <div class="font-controls">
                        <button class="font-btn" id="font-decrease-panel" title="Diminuir fonte">A-</button>
                        <button class="font-btn" id="font-increase-panel" title="Aumentar fonte">A+</button>
                    </div>
                </div>
                ${isLoggedIn ? `
                <div class="settings-item">
                    <span class="settings-item-label">Conta</span>
                    <button class="logout-btn" id="logout-btn-panel">Sair da conta</button>
                </div>` : ''}
            </div>
        </div>
    </div>`;

    document.currentScript.insertAdjacentHTML('beforebegin', html);

    // ── Dark mode ──
    function toggleDarkMode() {
        const nowDark = document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', nowDark ? 'on' : 'off');
        const icon = nowDark ? '☀️' : '🌙';
        document.getElementById('dark-toggle').textContent = icon;
        const panelBtn = document.getElementById('dark-toggle-panel');
        if (panelBtn) panelBtn.textContent = icon;
    }

    document.getElementById('dark-toggle').addEventListener('click', toggleDarkMode);
    const panelDarkToggle = document.getElementById('dark-toggle-panel');
    if (panelDarkToggle) panelDarkToggle.addEventListener('click', toggleDarkMode);

    // ── Tamanho de fonte ──
    const MAX_FONT = 2;
    const MIN_FONT = 0;

    function getFontLevel() {
        return parseInt(document.documentElement.getAttribute('data-font-size') || '0');
    }

    function setFontLevel(level) {
        document.documentElement.setAttribute('data-font-size', level);
        localStorage.setItem('fontSize', level);

        document.getElementById('font-decrease').disabled = level <= MIN_FONT;
        document.getElementById('font-increase').disabled = level >= MAX_FONT;

        const pd = document.getElementById('font-decrease-panel');
        const pi = document.getElementById('font-increase-panel');
        if (pd) pd.disabled = level <= MIN_FONT;
        if (pi) pi.disabled = level >= MAX_FONT;
    }

    setFontLevel(savedFontSize);

    document.getElementById('font-increase').addEventListener('click', () => {
        setFontLevel(Math.min(getFontLevel() + 1, MAX_FONT));
    });
    document.getElementById('font-decrease').addEventListener('click', () => {
        setFontLevel(Math.max(getFontLevel() - 1, MIN_FONT));
    });

    const panelIncrease = document.getElementById('font-increase-panel');
    const panelDecrease = document.getElementById('font-decrease-panel');
    if (panelIncrease) panelIncrease.addEventListener('click', () => {
        setFontLevel(Math.min(getFontLevel() + 1, MAX_FONT));
    });
    if (panelDecrease) panelDecrease.addEventListener('click', () => {
        setFontLevel(Math.max(getFontLevel() - 1, MIN_FONT));
    });

    // ── Logout ──
    function doLogout() {
        sessionStorage.removeItem('loggedUser');
        sessionStorage.removeItem('accountType');
        window.location.href = `${base}home-page.html`;
    }

    if (isLoggedIn) {
        document.getElementById('logout-btn').addEventListener('click', doLogout);
        const panelLogout = document.getElementById('logout-btn-panel');
        if (panelLogout) panelLogout.addEventListener('click', doLogout);
    }

    // ── Painel de opções ──
    const settingsOverlay = document.getElementById('settings-overlay');

    document.getElementById('settings-btn').addEventListener('click', () => {
        settingsOverlay.classList.add('open');
    });
    document.getElementById('settings-close').addEventListener('click', () => {
        settingsOverlay.classList.remove('open');
    });
    settingsOverlay.addEventListener('click', e => {
        if (e.target === settingsOverlay) settingsOverlay.classList.remove('open');
    });
})();
