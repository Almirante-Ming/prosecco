document.addEventListener('DOMContentLoaded', () => {
  const jsonSelect = document.getElementById('jsonSelect');
  const mediaList = document.getElementById('mediaList');
  const modal = document.getElementById('mediaModal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const atribuirBtn = document.getElementById('atribuirBtn');
  const limparBtn = document.getElementById('limparBtn');

  const deletarBtn = document.createElement('button');
  deletarBtn.textContent = 'Deletar';
  deletarBtn.className = 'button is-warning ml-2';
  document.querySelector('.field.is-grouped').appendChild(deletarBtn);

  function openModal(type, src) {
    modalContent.innerHTML = '';
    const el = document.createElement(type === 'image' ? 'img' : 'video');
    el.src = src;
    el.controls = true;
    modalContent.appendChild(el);
    modal.classList.add('is-active');
  }

  modalClose.onclick = () => modal.classList.remove('is-active');
  document.querySelector('.modal-background').onclick = () => modal.classList.remove('is-active');

  fetch('/control/show')
    .then(res => res.json())
    .then(files => {
      jsonSelect.innerHTML = '';
      files.forEach(file => {
        if (typeof file === 'string') {
          const opt = document.createElement('option');
          opt.value = file;
          opt.textContent = file.replace(/\.json$/, '');
          jsonSelect.appendChild(opt);
        }
      });
    });

  fetch('/control/views')
    .then(res => res.json())
    .then(medias => {
      mediaList.innerHTML = '';
      medias.forEach(media => {
        const column = document.createElement('div');
        column.className = 'column is-one-quarter';

        const card = document.createElement('div');
        card.className = 'box has-background-grey-darker';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = media.file;
        checkbox.className = 'mr-2';

        const filePath = `/static/img/uploads/${media.file}`;
        const mediaEl = document.createElement(media.type === 'image' ? 'img' : 'video');
        mediaEl.src = filePath;
        if (media.type === 'video') mediaEl.muted = true;
        mediaEl.onclick = (e) => {
          e.stopPropagation();
          openModal(media.type, filePath);
        };

        const wrapper = document.createElement('div');
        wrapper.className = 'media-card';
        wrapper.appendChild(checkbox);
        wrapper.appendChild(mediaEl);

        card.appendChild(wrapper);
        column.appendChild(card);
        mediaList.appendChild(column);
      });
    });

  atribuirBtn.onclick = () => {
    const checked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
    const data = checked.map(cb => {
      const type = cb.value.endsWith('.png') ? 'image' : 'video';
      return { file: cb.value, type };
    });

    const destino = jsonSelect.value;
    fetch(`/control/set?file=${encodeURIComponent(destino)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(json => alert(json.message || 'Arquivo atualizado!'));
  };

  limparBtn.onclick = () => {
    const destino = jsonSelect.value;
    fetch(`/control/set?file=${encodeURIComponent(destino)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ file: '', type: '' }])
    })
    .then(res => res.json())
    .then(json => alert(json.message || 'Arquivo limpo!'));
  };

  deletarBtn.onclick = () => {
    if (!confirm('Tem certeza que deseja deletar as mídias selecionadas')) return;

    const checked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
    const deletarArquivos = checked.map(cb => cb.value);

    const destino = jsonSelect.value;

    fetch(`/control/delete?file=${encodeURIComponent(destino)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deletarArquivos)
    })
    .then(res => res.json())
    .then(json => alert(json.message || 'Itens deletados do arquivo!'));
  };
});