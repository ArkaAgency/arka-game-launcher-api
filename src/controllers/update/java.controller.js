const getDirs = require('../../utils/getDirs');
const getFiles = require('../../utils/getFiles');
const path = require('path');

function getJavaData(req, res) {
    const { platform } = req.params;

    const allowedPlatforms = [
        'windows_x32', 'windows_x64'
    ];
    if (!allowedPlatforms.includes(platform)) return res.status(400).json({
        success: false,
        error: {
            message: {
                en: 'This Java platform isnt allowed!',
                fr: 'Cette plateforme Java est inaccessible !'
            }
        }
    });

    const javaFilesPath = path.join(__dirname, '../../../public/java/', platform);
    let folders = getDirs(javaFilesPath);
    let files = getFiles(javaFilesPath, folders, `java/${platform}/`);

    res.json({
        success: true,
        folders,
        files
    });
}

module.exports = getJavaData;