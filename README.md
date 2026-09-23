# Apresentação interativa Ciências Moleculares USP

Apresentação web criada para a Feira de Profissões da USP. A narrativa mostra
como o Ciências Moleculares parte de uma base científica comum e permite que
cada estudante construa uma trajetória própria em torno de problemas de
pesquisa.

## Como abrir

### Opção mais simples

Abra `dist/index.html` em qualquer navegador moderno. Esse arquivo contém todo
o CSS, JavaScript e conteúdo necessário e funciona sem internet.

### Versão modular para edição

Abra `index.html`. A versão modular carrega os arquivos das pastas `css`,
`js` e `data` separadamente, facilitando a manutenção.

Também é possível iniciar um servidor local:

```bash
npm run serve
```

Depois, acesse `http://localhost:8000`.

## Estrutura do projeto

- `index.html`: versão modular da apresentação.
- `css/styles.css`: identidade visual, layouts, responsividade e animações.
- `js/app.js`: navegação, teclado, fullscreen e interações.
- `data/conteudo.json`: perguntas, áreas, projetos e combinações de pesquisa.
- `data/conteudo.js`: versão do conteúdo carregada diretamente pelo navegador.
- `images/`: pasta reservada para imagens; a versão atual usa CSS e SVG.
- `scripts/build-standalone.mjs`: gera a versão autônoma em um único HTML.
- `dist/index.html`: versão pronta para apresentar, compartilhar ou hospedar.
- `.openai/hosting.json`: configuração da publicação do Site.

## Como editar o conteúdo

1. Altere `data/conteudo.json`.
2. Ajuste o HTML, o CSS ou o JavaScript, se necessário.
3. Gere novamente o arquivo autônomo:

```bash
npm run build
```

O comando atualiza `data/conteudo.js` e recria `dist/index.html`.

## Controles da apresentação

- `→`, `Espaço` ou `Page Down`: avançar.
- `←` ou `Page Up`: voltar.
- `Home` e `End`: primeira e última tela.
- `F`: entrar ou sair do modo tela cheia.
- `A`: ativar ou pausar o avanço automático.
- `?`: mostrar os atalhos.
- Gestos horizontais: navegar em telas sensíveis ao toque.

## Dependências

O projeto não utiliza bibliotecas externas. Para apresentar, basta um navegador
moderno. O Node.js é necessário apenas para executar o script de build.

## Observações sobre os dados

As cores representam consistentemente as grandes áreas:

- Matemática: vermelho.
- Física: laranja.
- Química: amarelo.
- Biologia: verde.
- Computação: azul.
- Humanidades: roxo.

Os projetos exibidos são exemplos reais do Ciclo Avançado fornecidos para a
apresentação. Não há informações pessoais, telefones ou endereços de e-mail.

