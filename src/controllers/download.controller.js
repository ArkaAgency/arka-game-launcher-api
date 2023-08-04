const fs = require('fs');
const path = require('path');

function getDownloadFile(req, res) {
    const { type, filename } = req.params;

    const validTypes = ['game', 'java', 'mods'];
    if (!validTypes.includes(type)) return res.status(400).json({
        success: false,
        error: {
            message: {
                en: 'The resource type isnt valid!',
                fr: 'Le type de la resource demandee est invalide !'
            }
        }
    });

    const filePath = path.join(__dirname, '../../public/', type, filename);
    if (!fs.existsSync(filePath)) return res.status(400).json({
        success: false,
        error: {
            message: {
                en: 'The resource doesnt exists!',
                fr: 'La resource demandee est inexistante !'
            }
        }
    });

    const authorizedDir = path.join(__dirname, '../../public/', type);
    if (!filePath.includes(authorizedDir)) return res.status(403).json({
        success: false,
        error: {
            message: {
                en: 'You are not allowed to download this resource!',
                fr: 'Vous n\'etes pas autorise a telecharger cette ressource !'
            }
        }
    });

    res.download(filePath);
}

module.exports = getDownloadFile;
