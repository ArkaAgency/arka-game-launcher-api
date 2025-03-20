const path = require("path");
const getDirs = require("../../utils/getDirs");
const getFiles = require("../../utils/getFiles");

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

module.exports = getGameData;
