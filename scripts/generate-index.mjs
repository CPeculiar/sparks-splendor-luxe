import { writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const clientDir = "dist/client";
const assetsDir = join(clientDir, "assets");

const files = readdirSync(assetsDir);
const jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!jsFile || !cssFile) {
  console.error("Could not find built assets:", files);
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sparks &amp; Splendour \u2014 Bespoke Luxury Fashion</title>
    <meta name="description" content="Bespoke suits, native attire &amp; couture by Sparks &amp; Splendour." />
    <link rel="icon" href="/logo.jpg" type="image/jpeg" />
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), html);
console.log("Generated dist/client/index.html -> " + jsFile + " + " + cssFile);
