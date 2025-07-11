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
        if (descricaoElement) descricaoElement.textContent = "Nao foi possivel carregar o clima";
      });
  }

  setInterval(fetchWeather, 300000);
  fetchWeather();