document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('current-date');

    function atualizarRelogio() {
        const agora = new Date();

        // --- Atualização do Relógio ---
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        const horaFormatada = `${horas}:${minutos}`;

        if (clockElement) {
            clockElement.textContent = horaFormatada;
        }

        // --- Atualização da Data ---
        if (dateElement) {
            const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
            let dataFormatada = agora.toLocaleDateString('pt-BR', options);

            // Formatar para o estilo desejado: [dia-semana, dia/mês/ano]
            const parts = dataFormatada.split(', ');
            let dayOfWeek = parts.shift(); // Remove e retorna o dia da semana
            const dateParts = parts.join('').split('/'); // Junta o restante e separa por '/'

            // Capitalizar a primeira letra do dia da semana
            dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

            const formattedDate = `${dayOfWeek}, ${dateParts.join('/')}`;
            dateElement.textContent = formattedDate;
        }
    }

    setInterval(atualizarRelogio, 1000);
    atualizarRelogio(); // Chamar na inicialização

    function gerarCalendario() {
        const diasContainer = document.getElementById("dias");
        const mesAnoElement = document.getElementById("mesAno");

        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();
        const diaHoje = hoje.getDate();

        const nomesMeses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        if (mesAnoElement) {
            mesAnoElement.textContent = `${nomesMeses [mes]} ${ano}`;
        }

        const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
        const totalDiasDoMes = new Date(ano, mes + 1, 0).getDate();

        let htmlCalendario = "<tr>";
        for (let i = 0; i < primeiroDiaDoMes; i++) {
            htmlCalendario += "<td></td>";
        }

        for (let dia = 1; dia <= totalDiasDoMes; dia++) {
            const classe = dia === diaHoje ? "hoje" : "";
            htmlCalendario += `<td class="${classe}">${dia}</td>`;
            if ((dia + primeiroDiaDoMes) % 7 === 0 && dia < totalDiasDoMes) {
                htmlCalendario += "</tr><tr>";
            }
        }
        htmlCalendario += "</tr>";

        if (diasContainer) {
            diasContainer.innerHTML = htmlCalendario;
        }
    }
    gerarCalendario();

    const API_KEY = "b37d4e6ea6d62ad6c108007b65655186";
    const cidade = "Tres Lagoas,BR";

    function fetchWeather() {
        const temperaturaElement = document.getElementById("temperatura");
        const descricaoElement = document.getElementById("descricao");
        const iconeClimaElement = document.getElementById("icone-clima");

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const temperatura = Math.round(data.main.temp);
                const descricao = data.weather [0].description;
                const codigoIcone = data.weather [0].icon;

                switch (codigoIcone) {
                    case "01d": iconeClimaElement.className = "fas fa-sun fa-lg"; break;
                    case "01n": iconeClimaElement.className = "fas fa-moon fa-lg"; break;
                    case "02d": iconeClimaElement.className = "fas fa-cloud-sun fa-lg"; break;
                    case "02n": iconeClimaElement.className = "fas fa-cloud-moon fa-lg"; break;
                    case "03d":
                    case "03n":
                    case "04d":
                    case "04n": iconeClimaElement.className = "fas fa-cloud fa-lg"; break;
                    case "09d":
                    case "09n":
                    case "10d":
                    case "10n": iconeClimaElement.className = "fas fa-cloud-showers-heavy fa-lg"; break;
                    case "11d":
                    case "11n": iconeClimaElement.className = "fas fa-bolt fa-lg"; break;
                    case "13d":
                    case "13n": iconeClimaElement.className = "fas fa-snowflake fa-lg"; break;
                    case "50d":
                    case "50n": iconeClimaElement.className = "fas fa-smog fa-lg"; break;
                    default: iconeClimaElement.className = "fas fa-cloud-sun fa-lg";
                }

                if (temperaturaElement) {
                    temperaturaElement.textContent = `${temperatura}°C`;
                }
                if (descricaoElement) {
                    descricaoElement.textContent = descricao.charAt(0).toUpperCase() + descricao.slice(1);
                }
            })
            .catch(error => {
                console.error("Erro ao carregar o clima:", error);
                if (descricaoElement) {
                    descricaoElement.textContent = "Não foi possível carregar o clima";
                }
            });
    }
    setInterval(fetchWeather, 300000);
    fetchWeather();

    const carouselContentArea = document.getElementById('carousel-content-area');
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;
    let mediaFiles = [];
    let currentIndex = 0;
    let carouselInterval;

    function adjustMediaSize(mediaElement) {
        mediaElement.style.width = '';
        mediaElement.style.height = '';
        mediaElement.style.objectFit = 'contain';

        const checkDimensions = () => {
            let naturalWidth, naturalHeight;

            if (mediaElement.tagName === 'IMG') {
                naturalWidth = mediaElement.naturalWidth;
                naturalHeight = mediaElement.naturalHeight;
            } else if (mediaElement.tagName === 'VIDEO') {
                naturalWidth = mediaElement.videoWidth;
                naturalHeight = mediaElement.videoHeight;
                if ((naturalWidth === 0 || naturalHeight === 0) && mediaElement.readyState < 1) {
                    setTimeout(checkDimensions, 100);
                    return;
                }
            }

            if (naturalWidth > 0 && naturalHeight > 0) {
                const aspectRatio = naturalWidth / naturalHeight;

                let newWidth = naturalWidth;
                let newHeight = naturalHeight;

                if (newWidth > MAX_WIDTH) {
                    newWidth = MAX_WIDTH;
                    newHeight = newWidth / aspectRatio;
                }

                if (newHeight > MAX_HEIGHT) {
                    newHeight = MAX_HEIGHT;
                    newWidth = newHeight * aspectRatio;
                }

                mediaElement.style.width = `${newWidth}px`;
                mediaElement.style.height = `${newHeight}px`;
                mediaElement.style.maxWidth = '100%';
                mediaElement.style.maxHeight = '100%';
            }
        };

        if (mediaElement.tagName === 'IMG') {
            if (mediaElement.complete) {
                checkDimensions();
            } else {
                mediaElement.addEventListener('load', checkDimensions, { once: true });
            }
        } else if (mediaElement.tagName === 'VIDEO') {
            mediaElement.addEventListener('loadedmetadata', checkDimensions, { once: true });
            if (mediaElement.readyState >= 1) {
                checkDimensions();
            }
        }
    }

    function showNextMedia() {
        if (!carouselContentArea) {
            console.error("Elemento 'carousel-content-area' não encontrado. Carrossel não pode ser inicializado.");
            return;
        }

        if (mediaFiles.length === 0) {
            carouselContentArea.innerHTML = '<p style="color: grey; text-align: center;">Nenhuma mídia para exibir no carrossel.</p>';
            return;
        }

        carouselContentArea.innerHTML = '';

        const media = mediaFiles [currentIndex];
        let mediaElement;

        if (media.type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = `/static/img/uploads/${media.file}`;
            mediaElement.alt = 'Painel de Exibição';
            mediaElement.style.borderRadius = '10px';
        } else if (media.type === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.src = `/static/img/uploads/${media.file}`;
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.muted = true;
            mediaElement.controls = false;
            mediaElement.style.borderRadius = '10px';
            mediaElement.play().catch(error => {
                console.warn('Autoplay de vídeo bloqueado ou falhou:', error);
            });
        } else {
            console.warn(`Tipo de mídia desconhecido: ${media.type}. Pulando para o próximo.`);
            currentIndex = (currentIndex + 1) % mediaFiles.length;
            showNextMedia();
            return;
        }

        carouselContentArea.appendChild(mediaElement);

        adjustMediaSize(mediaElement);

        currentIndex = (currentIndex + 1) % mediaFiles.length;
    }

    fetch('/static/show.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            mediaFiles = data;
            if (mediaFiles.length > 0) {
                showNextMedia();
                carouselInterval = setInterval(showNextMedia, 15000);
            } else {
                if (carouselContentArea) {
                    carouselContentArea.innerHTML = '<p style="color: grey; text-align: center;">Nenhuma mídia configurada no show.json.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Erro ao carregar o arquivo show.json:', error);
            if (carouselContentArea) {
                carouselContentArea.innerHTML = '<p style="color: grey; text-align: center;">Erro ao carregar mídias do carrossel.</p>';
            }
        });
});