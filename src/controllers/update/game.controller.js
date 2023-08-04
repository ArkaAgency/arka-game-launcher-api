const path = require('path');
const getDirs = require('../../utils/getDirs');
const getFiles = require('../../utils/getFiles');

function getGameData(req, res) {
    const gameFilesPath = path.join(__dirname, '../../../public/game/');

    let folders = getDirs(gameFilesPath);
    let files = getFiles(gameFilesPath, folders, 'game/');

    res.json({
        success: true,
        folders,
        files
    });
}

module.exports = getGameData;