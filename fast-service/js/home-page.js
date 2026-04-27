function verPerfil(nome) {
  document.getElementById("nomePerfil").innerText = nome;
  document.getElementById("modalPerfil").style.display = "block";
}

function fecharModal() {
  document.getElementById("modalPerfil").style.display = "none";
}
function scrollCarrossel(direcao) {
  const carrossel = document.getElementById("carrossel");
  carrossel.scrollLeft += direcao * 250;
}
function buscar() {
  const servico = document.getElementById("servico").value;
  const local = document.getElementById("local").value;

  window.location.href = `professionals-page.html?servico=${encodeURIComponent(servico)}&local=${encodeURIComponent(local)}`;
}
// Lista de serviços com seus símbolos
// Dados para as sugestões
const listaServicos = [
    { nome: 'Eletricista', icone: '⚡' },
    { nome: 'Encanador', icone: '🚰' },
    { nome: 'Limpeza Residencial', icone: '🧹' },
    { nome: 'Reformas e Manutenção', icone: '🛠️' },
    { nome: 'Tecnologia e Suporte', icone: '💻' },
    { nome: 'Jardinagem', icone: '🌱' }
];

const listaCidades = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Salvador, BA"];

// Função genérica para criar o autocomplete
function configurarAutocomplete(inputId, boxId, dados, ehServico = false) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(boxId);

    input.addEventListener('input', () => {
        const termo = input.value.toLowerCase();
        box.innerHTML = '';
        
        if (termo.length > 0) {
            const filtrados = ehServico 
                ? dados.filter(d => d.nome.toLowerCase().includes(termo))
                : dados.filter(d => d.toLowerCase().includes(termo));

            if (filtrados.length > 0) {
                box.style.display = 'block';
                filtrados.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'sugestao-item';
                    
                    if (ehServico) {
                        div.innerHTML = `<span class="icone">${item.icone}</span> <span>${item.nome}</span>`;
                        div.onclick = () => {
                            input.value = item.nome;
                            box.style.display = 'none';
                        };
                    } else {
                        div.innerHTML = `<span>📍 ${item}</span>`;
                        div.onclick = () => {
                            input.value = item;
                            box.style.display = 'none';
                        };
                    }
                    box.appendChild(div);
                });
            } else { box.style.display = 'none'; }
        } else { box.style.display = 'none'; }
    });
}

// Inicializa os dois campos
configurarAutocomplete('servico', 'lista-sugestoes', listaServicos, true);
configurarAutocomplete('local', 'lista-regioes', listaCidades, false);

// Fecha as listas ao clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-container')) {
        document.getElementById('lista-sugestoes').style.display = 'none';
        document.getElementById('lista-regioes').style.display = 'none';
    }
});

// FUNÇÃO BUSCAR (Única responsável por mudar de página)
function buscar() {
    const servico = document.getElementById("servico").value;
    const local = document.getElementById("local").value;

    if (!servico) {
        alert("Por favor, digite ou selecione um serviço.");
        return;
    }

    window.location.href = `professionals-page.html?servico=${encodeURIComponent(servico)}&local=${encodeURIComponent(local)}`;
}