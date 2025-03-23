const path = require("path");
const getDirs = require("../../utils/getDirs");
const getFiles = require("../../utils/getFiles");
const { existsSync, readFileSync } = require("fs");

async function getGameData(req, res) {
  const gameFilesPath = path.join(__dirname, "../../../public/game/");

  let folders = await getDirs(gameFilesPath);
  let files = await getFiles(gameFilesPath, folders, "game/");

  res.json({
    success: true,
    folders,
    files,
  });
}

async function getGameVersion(req, res) {
  const gameVersionFilePath = path.join(
    __dirname,
    "../../../public/game/version.ksf"
  );

  console.log(gameVersionFilePath);

  if (!existsSync(gameVersionFilePath))
    return res.json({
      success: false,
      error: {
        message: {
          en: "The version file cannot be found on remote",
          fr: "La fichier de version n'a pas pu etre trouve sur le serveur distant",
        },
      },
    });

  const gameVersionFile = readFileSync(gameVersionFilePath);

  return res.json({
    success: true,
    version: gameVersionFile.toString(),
  });
}

module.exports = { getGameData, getGameVersion };
