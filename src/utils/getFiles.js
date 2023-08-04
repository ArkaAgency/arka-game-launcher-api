const fs = require('fs');
const _path = require('path');
const { createHash } = require('crypto');

function getFiles(path, dirs, prefix) {
    let files = [];

    dirs.forEach(dirName => {
        const dirPath = _path.join(path, dirName);
        fs.readdirSync(dirPath).forEach((f) => {
            const filename = _path.join(dirPath, f);
            const isFile = fs.lstatSync(filename).isFile();
            if (isFile) {
                const buff = fs.readFileSync(filename);
                const hash = createHash('md5').update(buff).digest('hex');
                const fileObj = {
                    filename: _path.join(dirName, f).replaceAll('\\', '/'),
                    downloadLink: 'http://localhost:4004/download/' + (encodeURIComponent(_path.join(dirName, f).replaceAll('\\', '/'))) + `/${encodeURIComponent(prefix)}`,
                    md5: hash
                };
                files.push(fileObj);
            }
        });
    });

    return files;
}

module.exports = getFiles;