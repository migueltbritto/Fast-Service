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

    // Estilos dos botões do navbar
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
    `;
    document.head.appendChild(style);

    const isDark = document.documentElement.classList.contains('dark-mode');

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
                <a href="${base}select-account.html">
                    <img src="${base}img/user.png" alt="" class="users" id="userIcon">
                </a>
            </div>
        </nav>
    </header>`;

    document.currentScript.insertAdjacentHTML('beforebegin', html);

    // Dark mode toggle
    document.getElementById('dark-toggle').addEventListener('click', () => {
        const nowDark = document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', nowDark ? 'on' : 'off');
        document.getElementById('dark-toggle').textContent = nowDark ? '☀️' : '🌙';
    });

    // Font size controls
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
    }

    // Aplica estado inicial dos botões
    setFontLevel(savedFontSize);

    document.getElementById('font-increase').addEventListener('click', () => {
        setFontLevel(Math.min(getFontLevel() + 1, MAX_FONT));
    });

    document.getElementById('font-decrease').addEventListener('click', () => {
        setFontLevel(Math.max(getFontLevel() - 1, MIN_FONT));
    });
})();
