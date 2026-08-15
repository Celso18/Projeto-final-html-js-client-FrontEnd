Projeto-final-html-js-client-FrontEnd# Clima Fácil - Frontend 

Interface

Interface web construída de forma limpa e nativa para realizar consultas meteorológicas em tempo real e interagir com o servidor de persistência.

Integrações

1. API Pública Consumida: Utiliza o ecossistema da  Open-Meteo API (via `fetch`) para buscar as coordenadas geográficas (`/v1/search`) e em seguida o clima atualizado no endpoint de previsão (`/v1/forecast`).

2. API Interna: Conecta com a API local construída em Spring Boot (`http://localhost:8080/api/climas`) para executar todas as ações completas do CRUD.

Como executar o Projeto


1. Clone este repositório em sua máquina local.


2. Não são necessárias ferramentas complexas ou servidores de front. Basta abrir o arquivo `index.html` em qualquer navegador moderno para começar a usar a aplicação.
