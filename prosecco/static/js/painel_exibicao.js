document.addEventListener('DOMContentLoaded', () => {
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

    const API_KEY = "b37d4e6ea6d62ad6c108007b65655186";
    const cidade = "Tres Lagoas,BR";

    function fetchWeather() {
        const temperaturaElement = document.getElementById("temperatura");
        const descricaoElement = document.getElementById("descricao");
        const iconeClimaElement = document.getElementById("icone-clima");

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const temperatura = Math.round(data.main.temp);
                const descricao = data.weather[0].description;
                const codigoIcone = data.weather[0].icon;

                const iconeMap = {
                    "01d": "fas fa-sun fa-lg", "01n": "fas fa-moon fa-lg",
                    "02d": "fas fa-cloud-sun fa-lg", "02n": "fas fa-cloud-moon fa-lg",
                    "03d": "fas fa-cloud fa-lg", "03n": "fas fa-cloud fa-lg",
                    "04d": "fas fa-cloud fa-lg", "04n": "fas fa-cloud fa-lg",
                    "09d": "fas fa-cloud-showers-heavy fa-lg", "09n": "fas fa-cloud-showers-heavy fa-lg",
                    "10d": "fas fa-cloud-showers-heavy fa-lg", "10n": "fas fa-cloud-showers-heavy fa-lg",
                    "11d": "fas fa-bolt fa-lg", "11n": "fas fa-bolt fa-lg",
                    "13d": "fas fa-snowflake fa-lg", "13n": "fas fa-snowflake fa-lg",
                    "50d": "fas fa-smog fa-lg", "50n": "fas fa-smog fa-lg"
                };

                if (iconeClimaElement) {
                    iconeClimaElement.className = iconeMap[codigoIcone] || "fas fa-cloud-sun fa-lg";
                }
                if (temperaturaElement) temperaturaElement.textContent = `${temperatura}°C`;
                if (descricaoElement) descricaoElement.textContent = descricao.charAt(0).toUpperCase() + descricao.slice(1);
            })
            .catch(error => {
                console.error("Erro ao carregar o clima:", error);
                if (descricaoElement) descricaoElement.textContent = "Não foi possível carregar o clima";
            });
    }

    setInterval(fetchWeather, 300000);
    fetchWeather();

    const carouselContentArea = document.getElementById('carousel-content-area');
    const jsonFileName = document.body.dataset.jsonFile || 'show_control/system.json';
    let mediaFiles = [];
    let currentIndex = 0;

    async function showNextMedia() {
        if (!carouselContentArea) return;

        if (mediaFiles.length === 0) {
            carouselContentArea.innerHTML = '<p style="color: grey; text-align: center;">Nenhuma mídia para exibir.</p>';
            return;
        }

        const media = mediaFiles[currentIndex];
        const url = `/static/img/uploads/${media.file}`;
        let mediaElement;

        try {
            const cache = await caches.open('media-cache-template');
            let response = await cache.match(url);

            if (!response) {
                console.debug(`[MÍDIA] Baixando: ${media.file}`);
                response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response.clone());
                } else {
                    throw new Error(`Erro ao baixar ${url}`);
                }
            } else {
                console.debug(`[MÍDIA] Reutilizando cache: ${media.file}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            carouselContentArea.innerHTML = '';

            if (media.type === 'image') {
                mediaElement = document.createElement('img');
                mediaElement.src = blobUrl;
                mediaElement.alt = 'Imagem';
                carouselContentArea.appendChild(mediaElement);

                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % mediaFiles.length;
                    showNextMedia();
                }, 20000);

            } else if (media.type === 'video') {
                mediaElement = document.createElement('video');
                mediaElement.src = blobUrl;
                mediaElement.autoplay = true;
                mediaElement.controls = false;
                mediaElement.muted = true;

                mediaElement.addEventListener('ended', () => {
                    currentIndex = (currentIndex + 1) % mediaFiles.length;
                    showNextMedia();
                });

                mediaElement.addEventListener('loadedmetadata', () => {
                    mediaElement.play().catch(err => console.warn('Autoplay bloqueado:', err));
                });

                carouselContentArea.appendChild(mediaElement);
            } else {
                console.warn(`Tipo desconhecido: ${media.type}`);
                currentIndex = (currentIndex + 1) % mediaFiles.length;
                showNextMedia();
            }
        } catch (err) {
            console.error(`Erro ao exibir mídia ${media.file}:`, err);
            currentIndex = (currentIndex + 1) % mediaFiles.length;
            showNextMedia();
        }
    }

    async function carregarMidias(jsonPath) {
        try {
            console.debug(`[MÍDIA] Forçando atualização do cache...`);
            await caches.delete('media-cache-template');

            const response = await fetch(`/static/${jsonPath}`);
            if (!response.ok) throw new Error(`Erro ao carregar JSON: ${response.status}`);
            const midias = await response.json();

            const midiasValidas = Array.isArray(midias) && midias.every(media =>
                typeof media.type === 'string' && typeof media.file === 'string'
            );
            if (!midiasValidas) throw new Error("JSON inválido.");

            mediaFiles = midias;
            currentIndex = 0;
            showNextMedia();
        } catch (err) {
            console.error("Erro ao carregar mídias:", err);
            if (carouselContentArea) {
                carouselContentArea.innerHTML = '<p style="color: grey; text-align: center;">Erro ao carregar mídias.</p>';
            }
        }
    }
    carregarMidias(jsonFileName);

    setInterval(() => {
        console.debug('[MÍDIA] Verificando atualizações do JSON...');
        carregarMidias(jsonFileName);
    }, 300000);
});