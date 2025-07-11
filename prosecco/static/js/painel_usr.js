document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("adminSidebar");
  const toggle = document.getElementById("menuToggle");
  const closeSidebar = document.getElementById("closeSidebar");

  const welcomeSection = document.querySelector("main .section");
  const welcomeTitle = welcomeSection?.querySelector("h2.title");
  const welcomeSubtitle = welcomeSection?.querySelector("p.subtitle");

  const sections = {
    rotas: document.getElementById("uploadSection"),
  };

  const username = document.body.getAttribute("data-username");

  if (username) {
    if (welcomeTitle) welcomeTitle.innerText = `Bem-vindo, ${username}`;
    if (welcomeSubtitle) welcomeSubtitle.innerText = "Selecione uma opcao no menu a esquerda para comecar.";
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("active");
    });
  }

  document.getElementById("inicioLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (welcomeSection) welcomeSection.style.display = "block";

    for (const key in sections) {
      sections[key].style.display = "none";
    }

    sidebar.classList.remove("active");
  });

  document.getElementById("rotasLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (welcomeSection) welcomeSection.style.display = "none";

    for (const key in sections) {
      sections[key].style.display = key === "rotas" ? "block" : "none";
    }

    sidebar.classList.remove("active");
  });
});