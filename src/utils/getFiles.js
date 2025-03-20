const fs = require("fs/promises");
const path = require("path");

async function getFiles(basePath, dirs, prefix) {
  let files = [];
  let totalDirs = dirs.length;
  let processedDirs = 0;

  for (const dirName of dirs) {
    try {
      const dirPath = path.join(basePath, dirName);

      // Vérifie si le dossier existe avant d'essayer de le lire
      try {
        await fs.access(dirPath);
      } catch {
        console.warn(`⚠️ Dossier introuvable : ${dirPath}`);
        continue; // Passe au dossier suivant
      }

      const dirEntries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of dirEntries) {
        if (entry.isFile()) {
          const filename = path.join(dirName, entry.name).replace(/\\/g, "/");
          const fileBase64 = Buffer.from(filename).toString("base64");
          const prefixBase64 = Buffer.from(prefix).toString("base64");

          files.push({
            filename,
            downloadLink: `${process.env.API_HOSTNAME}/download/${fileBase64}/${prefixBase64}`,
          });
        }
      }

      // Affiche la progression en pourcentage
      processedDirs++;
      console.log(
        `📂 Progression : ${((processedDirs / totalDirs) * 100).toFixed(2)}% (${processedDirs}/${totalDirs})`
      );
    } catch (err) {
      console.error(`❌ Erreur lors de la lecture du dossier ${dirName}:`, err);
    }
  }

  return files;
}

module.exports = getFiles;
