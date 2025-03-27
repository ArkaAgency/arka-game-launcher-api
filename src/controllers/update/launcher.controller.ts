import { Request, Response } from "express";

function getLauncherVersion(req: Request, res: Response) {
  const launcherVersion = process.env.LAUNCHER_LATEST_RELEASE;

  res.send({
    success: true,
    launcherVersion,
  });
}

module.exports = { getLauncherVersion };
