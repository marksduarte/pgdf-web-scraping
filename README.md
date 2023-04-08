# pgdf-web-scraping

A solução aqui apresentada roda sobre a plataforma Node.js e tem como objetivo 
consultar quais precatórios estão elegíveis para acordo através do nome, 
número do precatório ou CPF e capturar os dados retornados pelo sistema da PGDF.

## Como executar

Este projeto foi elaborado utilizando o gerenciador de pacotes YARN, 
também é possível utilizar o NPM caso prefira.

1 - Clone o repositório:

```
git clone https://gitlab.com/marksduarte/pgdf-web-scraping.git
```

2 - Instale as dependências 
- [Pupperteer](https://github.com/puppeteer/puppeteer)
```
yarn add puppeteer
```
- [dotenv](https://github.com/motdotla/dotenv)
```
yarn add dotenv
```

3 - Renomeie o arquivo `.env.sample` para `.env` e informe o caminho do arquivo
que contém a lista nomes, número de precatório ou CPF que deseja consultar.

4 - Rode

```
node src/index.js
```

Aguarde alguns instantes pela mensagem de finalização no console.

> Caso queira ver as ações acontencendo na interface do navegador, altere no 
arquivo `.env` a flag `BACKGROUND_NAVIGATION` para `true`!