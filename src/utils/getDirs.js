const fs = require("fs/promises");
const path = require("path");

async function getDirs(basePath, ext = "") {
  let folders = [];

  try {
    // Vérifie si le dossier existe avant de lire
    const dirEntries = await fs.readdir(basePath, { withFileTypes: true });

    const subDirPromises = dirEntries
      .filter((entry) => entry.isDirectory()) // Filtrage direct
      .map(async (entry) => {
        const fullPath = path.join(basePath, entry.name);
        const folderPath = path.join(ext, entry.name).replace(/\\/g, "/");
        folders.push(folderPath);

        // Récursion asynchrone
        const subDirs = await getDirs(fullPath, folderPath);
        folders.push(...subDirs);
      });

    await Promise.all(subDirPromises); // Attendre toutes les lectures
  } catch (err) {
    console.error(`Erreur lors de la lecture du dossier ${basePath}:`, err);
  }

  return folders;
}

module.exports = getDirs;
