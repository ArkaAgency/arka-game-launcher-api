function getJavaData(req, res) {
    windows_x64(req, res);
}

function windows_x64(req, res) {
    res.json({});
}

function windows_x32(req, res) {
    res.json({});
}

function linux(req, res) {
    res.json({});
}

function macOs(req, res) {
    res.json({});
}

module.exports = getJavaData;