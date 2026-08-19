async function buscarClima(evento) {
    // Evita que a página recarregue ao clicar no botão
    if (evento) evento.preventDefault();

    const cidadeInput = document.getElementById("cidadeInput").value.trim();
    const feedback = document.getElementById("feedback");

    if (!cidadeInput) {
        if (feedback) {
            feedback.innerText = "Por favor, digite o nome de uma cidade.";
        }
        return;
    }

    if (feedback) {
        feedback.innerText = "Buscando informações...";
    }

    try {
        // 1. Busca a latitude e longitude da cidade
        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidadeInput)}&count=1&language=pt&format=json`;

        const geoResposta = await fetch(geoUrl);

        if (!geoResposta.ok) {
            throw new Error("Erro ao consultar a localização.");
        }

        const geoDados = await geoResposta.json();

        if (!geoDados.results || geoDados.results.length === 0) {
            throw new Error("Cidade não encontrada.");
        }

        // Pega o primeiro resultado
        const primeiraCidade = geoDados.results[0];

        const latitude = primeiraCidade.latitude;
        const longitude = primeiraCidade.longitude;
        const name = primeiraCidade.name;
        const country = primeiraCidade.country;

        // 2. Busca o clima usando latitude e longitude
        const climaUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,precipitation&timezone=auto`;

        const climaResposta = await fetch(climaUrl);

        if (!climaResposta.ok) {
            throw new Error("Erro ao consultar os dados do clima.");
        }

        const climaDados = await climaResposta.json();

        // 3. Organiza os dados
        const climaAtualEncontrado = {
            cidade: name,
            pais: country || "Não informado",
            temperatura: climaDados.current.temperature_2m,
            velocidadeVento: climaDados.current.wind_speed_10m,
            precipitacao: climaDados.current.precipitation
        };

        console.log("Dados do Clima carregados:", climaAtualEncontrado);

        // 4. Mostra o resultado
        if (feedback) {
            feedback.innerText =
                `Clima em ${name}: ${climaAtualEncontrado.temperatura}°C`;
        }

        console.log("Cidade:", climaAtualEncontrado.cidade);
        console.log("País:", climaAtualEncontrado.pais);
        console.log("Temperatura:", climaAtualEncontrado.temperatura);
        console.log("Vento:", climaAtualEncontrado.velocidadeVento);
        console.log("Precipitação:", climaAtualEncontrado.precipitacao);

    } catch (erro) {
        if (feedback) {
            feedback.innerText = `Erro: ${erro.message}`;
        }

        console.error("Detalhes do erro:", erro);
    }
}