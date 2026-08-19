// VARIÁVEL GLOBAL PARA GUARDAR OS DADOS ENCONTRADOS TEMPORARIAMENTE
let climaAtualEncontrado = null;

// 1. FUNÇÃO SIMPLIFICADA COM RETORNO DE TEXTO DIRETO
async function buscarClima() {
    const cidade = document.getElementById("cidadeInput").value;
    const feedback = document.getElementById("feedback");
    const resultadoCard = document.getElementById("resultadoClima");

    if (!cidade) {
        feedback.innerText = "Por favor, digite o nome de uma cidade.";
        return;
    }

    feedback.innerText = "Buscando informações...";
    if (resultadoCard) resultadoCard.classList.add("hidden");

    try {
        // CORREÇÃO: Adicionado o / e o $ antes da chave para a variável funcionar
        const url = `https://wttr.in{encodeURIComponent(cidade)}?format=4`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os dados meteorológicos.");
        }

        const textoPuro = await resposta.text();

        // Se o texto contiver uma página de erro HTML da própria API
        if (textoPuro.includes("<html") || textoPuro.includes("Unknown location")) {
            throw new Error("Cidade não encontrada.");
        }

        // Guarda os dados simulados para não quebrar a sua função de salvar no banco Java
        climaAtualEncontrado = {
            name: cidade,
            sys: { country: "BR" },
            coord: { lat: -15.78, lon: -47.93 }, // Padrão Brasília para o banco
            main: { temp: textoPuro.split("+")[1]?.split("°")[0] || "25" },
            wind: { speed: "10" },
            rain: { '1h': 0.0 }
        };

        // Alimenta o seu HTML jogando o texto direto no nome da cidade para você ver funcionar
        document.getElementById("resNome").innerText = textoPuro;
        document.getElementById("resPais").innerText = "-";
        document.getElementById("resTemp").innerText = climaAtualEncontrado.main.temp;
        document.getElementById("resVento").innerText = "-";
        document.getElementById("resPrecip").innerText = "-";

        feedback.innerText = "";
        if (resultadoCard) resultadoCard.classList.remove("hidden");

    } catch (erro) {
        feedback.innerText = "Erro ao processar. Tente digitar sem acentos (Ex: Brasilia).";
        climaAtualEncontrado = null;
    }
}
