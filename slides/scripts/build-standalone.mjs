import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceHtml = await readFile(path.join(projectRoot, "index.html"), "utf8");
const css = await readFile(path.join(projectRoot, "css", "styles.css"), "utf8");
const appJs = await readFile(path.join(projectRoot, "js", "app.js"), "utf8");
const content = JSON.parse(await readFile(path.join(projectRoot, "data", "conteudo.json"), "utf8"));
const dataJs = `window.CM_DATA = ${JSON.stringify(content, null, 2)};\n`;

await writeFile(path.join(projectRoot, "data", "conteudo.js"), dataJs, "utf8");

const standalone = sourceHtml
  .replace(
    '  <link rel="stylesheet" href="css/styles.css">',
    `  <style>\n${css.trimEnd()}\n  </style>`
  )
  .replace(
    '  <script src="data/conteudo.js"></script>\n  <script src="js/app.js"></script>',
    `  <script>\n${dataJs.trimEnd()}\n  </script>\n  <script>\n${appJs.trimEnd()}\n  </script>`
  );

await mkdir(path.join(projectRoot, "dist"), { recursive: true });
await writeFile(path.join(projectRoot, "dist", "index.html"), standalone, "utf8");
console.log("Arquivo standalone criado em dist/index.html");

