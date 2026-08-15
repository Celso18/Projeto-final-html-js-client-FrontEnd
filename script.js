const API_LOCAL = "http://localhost:8080/api/climas";
let climaAtual = null; // Armazena temporariamente o resultado da busca

function mostrarFeedback(msg, tipo = "info") {
    const fb = document.getElementById("feedback");
    fb.innerText = msg;
    fb.style.color = tipo === "erro" ? "#dc3545" : tipo === "sucesso" ? "#28a745" : "#1e3c72";
}

// 1. INTEGRAÇÃO COM API EXTERNA (Geocoding + Forecast)
async function buscarClima() {
    const cidade = document.getElementById("cidadeInput").value.trim();
    if (!cidade) return mostrarFeedback("Por favor, digite o nome de uma cidade.", "erro");

    mostrarFeedback("Buscando coordenadas (Loading)...");

    try {
        // Passo A: Encontrar Latitude e Longitude da Cidade
        const geoUrl = `https://open-meteo.com{encodeURIComponent(cidade)}&count=1&language=pt`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.getJson();

        if (!geoData.results || geoData.results.length === 0) {
            return mostrarFeedback("Cidade não encontrada no mapa.", "erro");
        }

        const local = geoData.results[0];

        // Passo B: Buscar Dados de Clima com as Coordenadas obtidas
        const weatherUrl = `https://open-meteo.com{local.latitude}&longitude=${local.longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.getJson();

        // Mapeia os dados estruturados de acordo com nossa Entidade do Back
        climaAtual = {
            cidade: local.name,
            pais: local.country || "Desconhecido",
            latitude: local.latitude,
            longitude: local.longitude,
            temperatura: weatherData.current_weather.temperature,
            velocidadeVento: weatherData.current_weather.windspeed,
            precipitacao: 0.0 // O endpoint simplificado retorna 0 caso não esteja detalhado
        };

        // Renderiza no Card do HTML
        document.getElementById("resNome").innerText = climaAtual.cidade;
        document.getElementById("resPais").innerText = climaAtual.pais;
        document.getElementById("resTemp").innerText = climaAtual.temperatura;
        document.getElementById("resVento").innerText = climaAtual.velocidadeVento;
        document.getElementById("resPrecip").innerText = climaAtual.precipitacao;

        document.getElementById("resultadoClima").classList.remove("hidden");
        mostrarFeedback("Clima carregado com sucesso!", "sucesso");

    } catch (error) {
        mostrarFeedback("Erro ao conectar com serviços climáticos.", "erro");
    }
}

// 2. OPERAÇÃO POST (Salvar Consulta)
async function salvarNoBanco() {
    if (!climaAtual) return;

    try {
        const response = await fetch(API_LOCAL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(climaAtual)
        });

        if (response.ok) {
            mostrarFeedback("Consulta salva com sucesso no MySQL!", "sucesso");
            carregarHistorico();
        } else {
            mostrarFeedback("Erro ao tentar salvar no banco de dados.", "erro");
        }
    } catch (error) {
        mostrarFeedback("Não foi possível conectar com o Backend Spring Boot.", "erro");
    }
}

// 3. OPERAÇÃO GET (Listar Consultas)
async function carregarHistorico() {
    try {
        const response = await fetch(API_LOCAL);
        const dados = await response.getJson();
       
        const lista = document.getElementById("listaHistorico");
        lista.innerHTML = "";

        dados.forEach(item => {
            const div = document.createElement("div");
            div.className = "item-clima";
            div.innerHTML = `
                <div>
                    <strong>${item.cidade} (${item.pais})</strong><br>
                    <span>🌡️ ${item.temperatura}°C | 💨 ${item.velocidadeVento}km/h</span>
                </div>
                <div class="actions">
                    <button class="btn-edit" onclick="editarTemperatura(${item.id}, ${item.temperatura})">✏️</button>
                    <button class="btn-delete" onclick="deletarRegistro(${item.id})">❌</button>
                </div>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao listar histórico.", error);
    }
}

// 4. OPERAÇÃO DELETE (Deletar do CRUD)
async function deletarRegistro(id) {
    if(!confirm("Deseja realmente excluir este registro?")) return;

    try {
        const response = await fetch(`${API_LOCAL}/${id}`, { method: "DELETE" });
        if(response.ok) {
            mostrarFeedback("Registro deletado!", "sucesso");
            carregarHistorico();
        }
    } catch (error) {
        mostrarFeedback("Erro ao deletar registro.", "erro");
    }
}

// 5. OPERAÇÃO PUT (Simulação de Atualização manual de dado incorreto)
async function editarTemperatura(id, tempAtual) {
    const novaTemp = prompt("Ajustar valor da temperatura (°C):", tempAtual);
    if (novaTemp === null || novaTemp === "") return;

    try {
        // Primeiro busca a lista para reenviar os dados obrigatórios daquele ID alterando apenas a temp
        const listRes = await fetch(API_LOCAL);
        const dados = await listRes.getJson();
        const registro = dados.find(x => x.id === id);

        registro.temperatura = parseFloat(novaTemp);

        const response = await fetch(`${API_LOCAL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registro)
        });

        if(response.ok) {
            mostrarFeedback("Registro atualizado com sucesso!", "sucesso");
            carregarHistorico();
        }
    } catch (error) {
        mostrarFeedback("Erro ao atualizar o registro.", "erro");
    }
}

// Inicializa a lista ao abrir a tela
window.onload = carregarHistorico;