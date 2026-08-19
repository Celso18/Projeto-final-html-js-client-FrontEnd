// VARIÁVEL GLOBAL PARA GUARDAR OS DADOS ENCONTRADOS TEMPORARIAMENTE
let climaAtualEncontrado = null;

// Crie uma conta gratuita em openweathermap.org para pegar sua chave
const API_KEY = "COLOQUE_AQUI_SUA_CHAVE_REAL_DO_OPENWEATHER"; 

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
        // CORREÇÃO: URL oficial da API do OpenWeather corrigida com interrogação e parâmetros
        const urlPublica = `https://openweathermap.org{cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;
        const resposta = await fetch(urlPublica);

        if (!resposta.ok) {
            throw new Error("Cidade não encontrada ou erro na API pública. Verifique se sua API_KEY está ativa.");
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
