const path = require('path');
const getDirs = require('../../utils/getDirs');
const getFiles = require('../../utils/getFiles');
const util = require('util');
const jarfile = require('jarfile');
const fs = require('fs');
const { createHash } = require('crypto');

const asyncJarCheck = util.promisify(jarfile.fetchJarAtPath);

async function getModsData(req, res) {
    const gameFilesPath = path.join(__dirname, '../../../public/mods/');

    let folders = getDirs(gameFilesPath);
    let files = getFiles(gameFilesPath, folders, 'mods/');

    const finalMods = [];
    for await (const fileData of files) {
        const modName = fileData.filename.split('/')[fileData.filename.split('/').length - 1];
        const modType = fileData.filename.split('/')[fileData.filename.split('/').length - 2];
        const modFilename = path.join(__dirname, '../../../public/mods/', fileData.filename);
        const modBuffer = fs.readFileSync(modFilename);
        const modHash = createHash('md5').update(modBuffer).digest('hex');

        let jarInfos;
        try {
            const jarInfosFetch = await asyncJarCheck(modFilename);
            jarInfos = {
                name:
                    jarInfosFetch.valueForManifestEntry(
                        'Specification-Title'
                    ) ||
                    jarInfosFetch.valueForManifestEntry(
                        'Implementation-Title'
                    ) ||
                    modName,
                author:
                    jarInfosFetch.valueForManifestEntry(
                        'Specification-Vendor'
                    ) ||
                    jarInfosFetch.valueForManifestEntry(
                        'Implementation-Vendor'
                    ) ||
                    '???',
                version:
                    jarInfosFetch.valueForManifestEntry(
                        'Implementation-Version'
                    ) ||
                    jarInfosFetch.valueForManifestEntry(
                        'Specification-Version'
                    ) ||
                    '???',
            };
        } catch {
            jarInfos = {
                name: modName,
                author: '???',
                version: '???',
            };
        }

        finalMods.push(
            {
                type: modType,
                description: '???',
                name: jarInfos.name,
                author: jarInfos.author,
                version: jarInfos.version,
                md5: modHash,
                filename: fileData.filename.split('/')[fileData.filename.split('/').length - 1],
            }
        );
    }

    res.json({
        success: true,
        folders,
        files,
        mods: finalMods,
    });
}

module.exports = getModsData;
