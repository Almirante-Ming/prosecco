const clockElement = document.getElementById('clock');
  const dateElement = document.getElementById('current-date');

  function atualizarRelogio() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    if (clockElement) clockElement.textContent = `${horas}:${minutos}`;

    if (dateElement) {
      const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
      let dataFormatada = agora.toLocaleDateString('pt-BR', options);
      const parts = dataFormatada.split(', ');
      let dayOfWeek = parts.shift();
      const dateParts = parts.join('').split('/');
      dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
      dateElement.textContent = `${dayOfWeek}, ${dateParts.join('/')}`;
    }
  }

  setInterval(atualizarRelogio, 1000);
  atualizarRelogio();