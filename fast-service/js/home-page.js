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