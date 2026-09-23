# Slides automaticos

Esta pasta contem a versao em formato de apresentacao automatica.

Ela preserva a narrativa principal sobre o curso, inicia o avanco automatico ao
abrir e mantem o grafo de projetos reais do Ciclo Avancado. As partes de escolha
de perguntas cientificas e combinacao de areas ficarao concentradas na futura
pagina interativa para smartphone.

## Como abrir

Abra `dist/index.html` em um navegador moderno, ou use a versao modular
`index.html` durante a edicao.

## Como gerar a versao pronta

Na raiz do projeto:

```bash
npm run build:slides
```

O comando recria `slides/data/conteudo.js` e `slides/dist/index.html`.
