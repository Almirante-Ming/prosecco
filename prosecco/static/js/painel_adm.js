document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("adminSidebar");
  const toggle = document.getElementById("menuToggle");
  const closeSidebar = document.getElementById("closeSidebar");

  const welcomeSection = document.querySelector("main .section");
  const welcomeTitle = welcomeSection.querySelector("h2.title");
  const welcomeSubtitle = welcomeSection.querySelector("p.subtitle");

  const sections = {
    upload: document.getElementById("uploadSection"),
    selecionar: document.getElementById("selecionarTelasSection"),
    gerenciar: document.getElementById("gerenciarContasSection"),
  };

  const username = document.body.getAttribute("data-username");

  if (username) {
    if (welcomeTitle) {
      welcomeTitle.innerText = `Bem-vindo, ${username}`;
    }
    if (welcomeSubtitle) {
      welcomeSubtitle.innerText = "Selecione uma opcao no menu a esquerda para comecar.";
    }
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

  const links = document.querySelectorAll(".menu-list li");

  if (links.length >= 4) {
    links[0].addEventListener("click", (e) => {
      e.preventDefault();

      if (welcomeSection) welcomeSection.style.display = "block";

      for (const key in sections) {
        sections[key].style.display = "none";
      }

      sidebar.classList.remove("active");
    });

    links[1].addEventListener("click", (e) => {
      e.preventDefault();
      toggleSections("upload");
    });

    links[2].addEventListener("click", (e) => {
      e.preventDefault();
      toggleSections("selecionar");
    });

    links[3].addEventListener("click", (e) => {
      e.preventDefault();
      toggleSections("gerenciar");
    });
  }

  function toggleSections(show) {
    if (welcomeSection) welcomeSection.style.display = "none";

    for (const key in sections) {
      sections[key].style.display = key === show ? "block" : "none";
    }

    sidebar.classList.remove("active");
  }

  const viewGroupMediaBtn = document.getElementById("viewGroupMediaBtn");
  const groupMediaModal = document.getElementById("groupMediaModal");
  const closeGroupMediaModal = document.getElementById("closeGroupMediaModal");
  const cancelGroupMediaBtn = document.getElementById("cancelGroupMediaBtn");
  const removeSelectedMediaBtn = document.getElementById("removeSelectedMediaBtn");
  const groupMediaList = document.getElementById("groupMediaList");
  const jsonSelect = document.getElementById("jsonSelect");

  function openModal(modal) {
    modal.classList.add("is-active");
  }

  function closeModal(modal) {
    modal.classList.remove("is-active");
    groupMediaList.innerHTML = '';
  }

  async function loadJsonGroups() {
    try {
      const response = await fetch('/control/show');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const files = await response.json();

      jsonSelect.innerHTML = '<option disabled selected>Selecione um Grupo</option>';
      files.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        jsonSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar grupos de midia:", error);
      jsonSelect.innerHTML = '<option disabled selected>Erro ao Carregar Grupos</option>';
    }
  }

  loadJsonGroups();

  function getCleanFilename(filename) {
    const uuidRegex = /^[0-9a-fA-F]{32}_/;
    if (filename && uuidRegex.test(filename)) {
      return filename.replace(uuidRegex, '');
    }
    return filename;
  }

  if (viewGroupMediaBtn) {
    viewGroupMediaBtn.addEventListener("click", async () => {
      const selectedJsonFilename = jsonSelect.value;
      if (!selectedJsonFilename || selectedJsonFilename === 'Selecione um Grupo') {
        alert("Por favor, selecione um grupo primeiro.");
        return;
      }

      groupMediaList.innerHTML = '<p class="has-text-centered">Carregando midias...</p>';
      openModal(groupMediaModal);

      try {
        const response = await fetch(`/control/show/${selectedJsonFilename}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}. Nao foi possivel buscar o conteudo do arquivo de configuracao.`);
        }
        const media = await response.json();

        groupMediaList.innerHTML = '';

        if (!Array.isArray(media) || media.length === 0) {
          groupMediaList.innerHTML = '<p class="has-text-centered">Nenhuma midia encontrada neste grupo ou formato invalido.</p>';
          return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('list');

        media.forEach(item => {
          const li = document.createElement('li');
          li.classList.add('list-item', 'is-flex', 'is-align-items-center', 'py-2');
          li.style.borderBottom = '1px solid #eee';

          let previewHtml = '';
          const mediaFilePath = `/static/uploads/${item.file}`;
          const isImage = item.type === 'image';
          const isVideo = item.type === 'video';
          const cleanFileNameDisplay = getCleanFilename(item.file || 'Arquivo Desconhecido');

          if (isImage) {
            previewHtml = `<figure class="image is-96x96 mr-0"><img src="${mediaFilePath}" alt="${cleanFileNameDisplay}" style="object-fit: cover;"></figure>`;
          } else if (isVideo) {
            previewHtml = `<figure class="image is-96x96 mr-0"><video src="${mediaFilePath}" style="object-fit: cover; width: 96px; height: 96px;"></video></figure>`;
          } else {
            previewHtml = `<span class="icon is-large mr-0"><i class="fas fa-file fa-3x"></i></span>`;
          }

          li.innerHTML = `
            <label class="checkbox is-flex is-align-items-center" style="width: 100%;">
              <input type="checkbox" data-filename="${item.file}" class="mr-3">
              ${previewHtml}
              <span class="is-clipped" style="flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: none;" title="${cleanFileNameDisplay}">${cleanFileNameDisplay}</span>
              <span class="tag is-light is-small ml-2">${item.type || 'unknown'}</span>
            </label>
          `;
          ul.appendChild(li);
        });
        groupMediaList.appendChild(ul);

      } catch (error) {
        console.error("Erro ao carregar midias do grupo:", error);
        groupMediaList.innerHTML = `<p class="has-text-danger has-text-centered">Erro ao carregar midias: ${error.message}.</p>`;
      }
    });
  }

  if (closeGroupMediaModal) {
    closeGroupMediaModal.addEventListener("click", () => closeModal(groupMediaModal));
  }

  if (cancelGroupMediaBtn) {
    cancelGroupMediaBtn.addEventListener("click", () => closeModal(groupMediaModal));
  }

  if (removeSelectedMediaBtn) {
    removeSelectedMediaBtn.addEventListener("click", async () => {
      const selectedJsonFilename = jsonSelect.value;
      if (!selectedJsonFilename) {
        alert("Erro: Nenhum grupo selecionado.");
        return;
      }

      const checkboxes = groupMediaList.querySelectorAll('input[type="checkbox"]:checked');
      const filesToDelete = Array.from(checkboxes).map(cb => cb.dataset.filename);

      if (filesToDelete.length === 0) {
        alert("Por favor, selecione as midias para remover.");
        return;
      }

      if (!confirm(`Tem certeza que deseja remover ${filesToDelete.length} midia(s) do grupo ${selectedJsonFilename}?`)) {
        return;
      }

      try {
        const getResponse = await fetch(`/control/show/${selectedJsonFilename}`);
        if (!getResponse.ok) {
          throw new Error(`HTTP error! status: ${getResponse.status}. Nao foi possivel buscar a configuracao atual.`);
        }
        let currentMedia = await getResponse.json();

        if (!Array.isArray(currentMedia)) {
          console.warn("Conteudo do arquivo de configuracao nao e um array. Inicializando como vazio.");
          currentMedia = [];
        }

        const updatedMedia = currentMedia.filter(item => !filesToDelete.includes(item.file));

        const putResponse = await fetch(`/control/set?file=${selectedJsonFilename}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedMedia)
        });

        if (!putResponse.ok) {
          const errorData = await putResponse.json();
          throw new Error(`HTTP error! status: ${putResponse.status}: ${errorData.error || putResponse.statusText}`);
        }

        const result = await putResponse.json();
        if (result.message) {
          alert(result.message);
          closeModal(groupMediaModal);
          viewGroupMediaBtn.click();
        } else {
          alert(`Erro: ${result.error || 'Ocorreu um erro desconhecido.'}`);
        }
      } catch (error) {
        console.error("Erro ao remover midias:", error);
        alert(`Ocorreu um erro ao tentar remover as midias: ${error.message}`);
      }
    });
  }
});