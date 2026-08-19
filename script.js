// 1. FUNÇÃO ADAPTADA PARA OPEN-METEO (Sem necessidade de API Key)
async function buscarClima() {
    const cidade = document.getElementById("cidadeInput").value;
    const feedback = document.getElementById("feedback");
    const resultadoCard = document.getElementById("resultadoClima");

    if (!cidade) {
        feedback.innerText = "Por favor, digite o nome de uma cidade.";
        return;
    }

    feedback.innerText = "Buscando informações...";
    resultadoCard.classList.add("hidden");

    try {
        // Passo 1: Transforma o nome da cidade em Latitude e Longitude (Geocoding)
        const urlGeocoding = `https://open-meteo.com{encodeURIComponent(cidade)}&count=1&language=pt`;
        const respostaGeo = await fetch(urlGeocoding);
        const dadosGeo = await respostaGeo.json();

        if (!dadosGeo.results || dadosGeo.results.length === 0) {
            throw new Error("Cidade não encontrada. Verifique a grafia.");
        }

        const local = dadosGeo.results[0];
        const lat = local.latitude;
        const lon = local.longitude;

        // Passo 2: Busca o clima atual usando as coordenadas encontradas
        const urlClima = `https://open-meteo.com{lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,rain&timezone=auto`;
        const respostaClima = await fetch(urlClima);
        const dadosClima = await respostaClima.json();

        // Passo 3: Salva os dados no formato que seu botão "Salvar" espera
        climaAtualEncontrado = {
            name: local.name,
            sys: { country: local.country_code || "-" },
            coord: { lat: lat, lon: lon },
            main: { temp: dadosClima.current.temperature_2m },
            wind: { speed: dadosClima.current.wind_speed_10m },
            rain: { '1h': dadosClima.current.rain || 0.0 }
        };

        // Passo 4: Atualiza a tela (HTML)
        document.getElementById("resNome").innerText = climaAtualEncontrado.name;
        document.getElementById("resPais").innerText = climaAtualEncontrado.sys.country;
        document.getElementById("resTemp").innerText = climaAtualEncontrado.main.temp;
        document.getElementById("resVento").innerText = climaAtualEncontrado.wind.speed;
        document.getElementById("resPrecip").innerText = climaAtualEncontrado.rain['1h'];

        feedback.innerText = "";
        resultadoCard.classList.remove("hidden");

    } catch (erro) {
        feedback.innerText = erro.message;
        climaAtualEncontrado = null;
    }
}
