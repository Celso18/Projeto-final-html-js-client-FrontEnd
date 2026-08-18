// VARIÁVEL GLOBAL PARA GUARDAR OS DADOS ENCONTRADOS TEMPORARIAMENTE
let climaAtualEncontrado = null;

// CONFIGURAÇÃO DA API PÚBLICA (Substitua pela API que está usando no projeto, ex: OpenWeather)
const API_KEY = "SUA_API_KEY_AQUI"; 

// 1. FUNÇÃO PARA BUSCAR CLIMA NA API PÚBLICA (Chamada na linha 17 do HTML)
async function buscarClima() {
    const cidade = document.getElementById("cidadeInput").value;
    const feedback = document.getElementById("feedback");
    const resultadoCard = document.getElementById("resultadoClima");

    if (!cidade) {
        feedback.innerText = "Por favor, digite o nome de uma cidade.";
        return;
    }

    feedback.innerText = "Buscando informações...";
    resultadoCard.classList.add("hidden"); // Esconde o card antigo enquanto busca

    try {
        // Exemplo usando OpenWeatherMap (Ajuste a URL se estiver usando outra API pública)
        const urlPublica = `https://openweathermap.org{cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;
        const resposta = await fetch(urlPublica);

        if (!resposta.ok) {
            throw new Error("Cidade não encontrada ou erro na API pública.");
        }

        const dados = await resposta.json();
        
        // Guarda os dados brutos na nossa variável global para usar na hora de salvar
        climaAtualEncontrado = dados;

        // Preenche as informações nas tags <span> correspondentes do seu HTML
        document.getElementById("resNome").innerText = dados.name;
        document.getElementById("resPais").innerText = dados.sys.country;
        document.getElementById("resTemp").innerText = dados.main.temp;
        document.getElementById("resVento").innerText = dados.wind.speed;
        
        // Verifica se há dados de chuva, senão define como 0.0
        const chuva = dados.rain ? (dados.rain['1h'] || dados.rain['3h'] || 0.0) : 0.0;
        document.getElementById("resPrecip").innerText = chuva;

        // Limpa mensagens e mostra o card com o resultado (Remove a classe 'hidden')
        feedback.innerText = "";
        resultadoCard.classList.remove("hidden");

    } catch (erro) {
        feedback.innerText = erro.message;
        climaAtualEncontrado = null;
    }
}

// 2. FUNÇÃO PARA ENVIAR PARA O SEU BACKEND SPRING BOOT (Chamada na linha 30 do HTML)
async function salvarNoBanco() {
    const feedback = document.getElementById("feedback");

    if (!climaAtualEncontrado) {
        feedback.innerText = "Nenhum dado de clima disponível para salvar. Busque uma cidade primeiro.";
        return;
    }

    feedback.innerText = "Salvando no histórico do banco de dados...";

    // Monta o JSON exatamente com os nomes dos atributos da sua classe "Clima" do Java
    const payloadParaOJava = {
        cidade: climaAtualEncontrado.name,
        pais: climaAtualEncontrado.sys.country,
        latitude: climaAtualEncontrado.coord.lat,
        longitude: climaAtualEncontrado.coord.lon,
        temperatura: climaAtualEncontrado.main.temp, // Mapeia para o 'temperature' da Entity
        velocidadeVento: climaAtualEncontrado.wind.speed,
        precipitacao: climaAtualEncontrado.rain ? (climaAtualEncontrado.rain['1h'] || 0.0) : 0.0
    };

    try {
        const urlDoSeuSpring = "http://localhost:8080/api/clima";
        const respostaBackEnd = await fetch(urlDoSeuSpring, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payloadParaOJava)
        });

        if (respostaBackEnd.ok) {
            feedback.innerText = "Clima salvo com sucesso no banco de dados!";
            // Opcional: Chamar uma função aqui para listar o histórico atualizado na tela
        } else {
            feedback.innerText = "Erro do servidor ao tentar salvar os dados.";
        }

    } catch (erro) {
        console.error("Erro de conexão com o Spring:", erro);
        feedback.innerText = "Não foi possível conectar com o servidor local (Spring Boot desligado?).";
    }
}
