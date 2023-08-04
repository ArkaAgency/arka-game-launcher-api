const fs = require('fs');
const _path = require('path');

function getDirs(path, ext='') {
    let folders = [];

    fs.readdirSync(path, {
        recursive: true,
    }).forEach((f) => {
        const isDir = fs.lstatSync(_path.join(path, f)).isDirectory();
        if (isDir) {
            folders.push(ext + '/' + f);
            folders = folders.concat(getDirs(
                _path.join(path, f),
                ext + '/' + f
            ));
        }
    });

    return folders;
}

module.exports = getDirs;