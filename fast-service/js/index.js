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
const userIcon = document.getElementById("userIcon");
const userMenu = document.getElementById("userMenu");

userIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  userMenu.style.display =
    userMenu.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", () => {
  userMenu.style.display = "none";
});