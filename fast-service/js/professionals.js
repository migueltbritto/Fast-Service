(function () {
    const grid          = document.querySelector('.grid-profissionais');
    const cards         = Array.from(grid.querySelectorAll('.card'));
    const selectServico   = document.getElementById('filter-servico');
    const selectBairro    = document.getElementById('filter-bairro');
    const selectAvaliacao = document.getElementById('filter-avaliacao');
    const rangePreco      = document.getElementById('filter-preco-range');
    const inputPreco      = document.getElementById('filter-preco-text');
    const btnFiltrar      = document.getElementById('btn-filtrar');
    const btnLimpar       = document.getElementById('btn-limpar');

    // --- Extratores de dados dos cards ---

    function getServico(card) {
        return card.querySelector('.tag')?.textContent.trim() ?? '';
    }

    function getBairro(card) {
        const el = card.querySelector('p:not(.tag):not(.preco)');
        return el?.textContent.trim().split(',')[0].trim() ?? '';
    }

    function getPreco(card) {
        const t = card.querySelector('.preco')?.textContent ?? '';
        if (!t.includes('R$')) return null; // "Combinar preço" = sem valor fixo
        const n = parseInt(t.replace(/\D/g, ''));
        return isNaN(n) ? null : n;
    }

    function getRating(card) {
        const span = card.querySelector('span:not(.badge)');
        const m = span?.textContent.match(/\((\d+\.?\d*)\)/);
        return m ? parseFloat(m[1]) : 0;
    }

    // --- Lógica de filtro ---

    function applyFilters() {
        const servicoVal  = selectServico.value;
        const bairroVal   = selectBairro.value;
        const minRating   = parseFloat(selectAvaliacao.value); // NaN se "Qualquer uma"
        const precoRaw    = inputPreco.value.replace(/\D/g, '');
        const precoMax    = precoRaw !== '' ? parseInt(precoRaw) : null;

        let visible = 0;

        cards.forEach(card => {
            let ok = true;

            if (servicoVal) {
                ok = ok && getServico(card).toLowerCase() === servicoVal.toLowerCase();
            }

            if (bairroVal) {
                ok = ok && getBairro(card).toLowerCase() === bairroVal.toLowerCase();
            }

            if (!isNaN(minRating)) {
                ok = ok && getRating(card) >= minRating;
            }

            if (precoMax !== null) {
                const preco = getPreco(card);
                if (preco !== null) ok = ok && preco <= precoMax;
                // cards com "Combinar preço" passam pelo filtro de preço
            }

            card.style.display = ok ? '' : 'none';
            if (ok) visible++;
        });

        // Mensagem de estado vazio
        let empty = grid.querySelector('.sem-resultados');
        if (visible === 0) {
            if (!empty) {
                empty = document.createElement('p');
                empty.className = 'sem-resultados';
                empty.textContent = 'Nenhum profissional encontrado com os filtros selecionados.';
                empty.style.cssText = 'grid-column:1/-1;text-align:center;color:#666;padding:40px 20px;font-size:1rem;';
                grid.appendChild(empty);
            }
        } else {
            empty?.remove();
        }
    }

    function limparFiltros() {
        selectServico.value   = '';
        selectBairro.value    = '';
        selectAvaliacao.value = '';
        rangePreco.value      = rangePreco.max;
        inputPreco.value      = '';
        applyFilters();
    }

    // --- Sincronização range ↔ campo de texto ---

    rangePreco.addEventListener('input', () => {
        const val = parseInt(rangePreco.value);
        inputPreco.value = `R$ ${val.toLocaleString('pt-BR')}`;
        applyFilters();
    });

    inputPreco.addEventListener('input', () => {
        const raw = inputPreco.value.replace(/\D/g, '');
        if (raw !== '') {
            const clamped = Math.min(Math.max(parseInt(raw), parseInt(rangePreco.min)), parseInt(rangePreco.max));
            rangePreco.value = clamped;
        }
    });

    inputPreco.addEventListener('keydown', e => {
        if (e.key === 'Enter') applyFilters();
    });

    // --- Filtro instantâneo nos selects ---

    [selectServico, selectBairro, selectAvaliacao].forEach(sel => {
        sel.addEventListener('change', applyFilters);
    });

    btnFiltrar.addEventListener('click', applyFilters);
    btnLimpar.addEventListener('click', limparFiltros);
})();
