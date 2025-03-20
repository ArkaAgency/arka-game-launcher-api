function getLauncherVersion(req, res) {
  const launcherVersion = process.env.LAUNCHER_LATEST_RELEASE;

  res.send({
    success: true,
    launcherVersion,
  });
}

module.exports = { getLauncherVersion };
