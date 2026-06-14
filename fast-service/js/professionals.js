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

    // --- Agendamento ---

    const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                       'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    function makeScheduler(monthEl, dayEl, timeEl, errorEl) {
        const today     = new Date();
        const currMonth = today.getMonth();
        const currDay   = today.getDate();

        // Popula apenas meses a partir do atual (sem datas passadas)
        for (let m = currMonth; m <= 11; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = MONTHS_PT[m];
            monthEl.appendChild(opt);
        }

        function repopulateDays() {
            dayEl.innerHTML = '<option value="">Dia</option>';
            dayEl.disabled  = monthEl.value === '';
            if (monthEl.value === '') return;

            const selMonth    = parseInt(monthEl.value);
            const daysInMonth = new Date(today.getFullYear(), selMonth + 1, 0).getDate();
            const startDay    = selMonth === currMonth ? currDay : 1;

            for (let d = startDay; d <= daysInMonth; d++) {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = String(d).padStart(2, '0');
                dayEl.appendChild(opt);
            }
        }

        monthEl.addEventListener('change', repopulateDays);

        return {
            reset() {
                monthEl.value = '';
                dayEl.innerHTML = '<option value="">Dia</option>';
                dayEl.disabled  = true;
                timeEl.value    = '';
                errorEl.style.display = 'none';
            },
            validate() {
                const ok = monthEl.value !== '' && dayEl.value !== '' && timeEl.value !== '';
                errorEl.style.display = ok ? 'none' : 'block';
                return ok;
            },
            getFormatted() {
                return `${String(dayEl.value).padStart(2, '0')} de ${MONTHS_PT[parseInt(monthEl.value)]} às ${timeEl.value}`;
            }
        };
    }

    // --- Modal: Patricia Oliveira ---

    const modalPatricia       = document.getElementById('modal-patricia');
    const btnContatarPatricia = document.getElementById('btn-contatar-patricia');
    const schedulerP = makeScheduler(
        document.getElementById('p-month'),
        document.getElementById('p-day'),
        document.getElementById('p-time'),
        document.getElementById('p-error')
    );

    document.getElementById('btn-contratar-patricia').addEventListener('click', () => {
        const loggedUser   = JSON.parse(sessionStorage.getItem('loggedUser') || 'null');
        const isEnterprise = loggedUser?.type === 'enterprise';
        document.getElementById('btn-requisitar-patricia').style.display = '';
        btnContatarPatricia.style.display = isEnterprise ? '' : 'none';
        btnContatarPatricia.textContent   = 'Contatar';
        schedulerP.reset();
        modalPatricia.classList.add('open');
    });

    // Troca "Contatar" → "Agendar" quando um mês é selecionado (só visível para empresa)
    document.getElementById('p-month').addEventListener('change', () => {
        btnContatarPatricia.textContent = document.getElementById('p-month').value ? 'Agendar' : 'Contatar';
    });

    document.getElementById('modal-patricia-fechar').addEventListener('click', () => {
        modalPatricia.classList.remove('open');
    });

    modalPatricia.addEventListener('click', e => {
        if (e.target === modalPatricia) modalPatricia.classList.remove('open');
    });

    document.getElementById('btn-requisitar-patricia').addEventListener('click', () => {
        alert('Serviço requisitado! Patricia Oliveira entrará em contato em breve.');
        modalPatricia.classList.remove('open');
    });

    btnContatarPatricia.addEventListener('click', () => {
        if (btnContatarPatricia.textContent === 'Agendar') {
            if (!schedulerP.validate()) return;
            alert(`Visita agendada com Patricia Oliveira para ${schedulerP.getFormatted()}!`);
            modalPatricia.classList.remove('open');
        } else {
            alert('Redirecionando para o contato com Patricia Oliveira...');
            modalPatricia.classList.remove('open');
        }
    });

    // --- Modal: João Silva ---

    const modalJoao  = document.getElementById('modal-joao');
    const schedulerJ = makeScheduler(
        document.getElementById('j-month'),
        document.getElementById('j-day'),
        document.getElementById('j-time'),
        document.getElementById('j-error')
    );

    const btnContatarJoao = document.getElementById('btn-contatar-joao');

    document.getElementById('btn-contratar-joao').addEventListener('click', () => {
        const loggedUser   = JSON.parse(sessionStorage.getItem('loggedUser') || 'null');
        const isEnterprise = loggedUser?.type === 'enterprise';
        btnContatarJoao.style.display = isEnterprise ? '' : 'none';
        schedulerJ.reset();
        modalJoao.classList.add('open');
    });

    document.getElementById('modal-joao-fechar').addEventListener('click', () => {
        modalJoao.classList.remove('open');
    });

    modalJoao.addEventListener('click', e => {
        if (e.target === modalJoao) modalJoao.classList.remove('open');
    });

    document.getElementById('btn-agendar-joao').addEventListener('click', () => {
        if (!schedulerJ.validate()) return;
        alert(`Visita agendada com João Silva para ${schedulerJ.getFormatted()}!`);
        modalJoao.classList.remove('open');
    });

    btnContatarJoao.addEventListener('click', () => {
        alert('Redirecionando para o contato com João Silva...');
        modalJoao.classList.remove('open');
    });
})();
