import { Request, Response } from "express";
import fs from "fs";
import path from "path";

function getDownloadFile(req: Request, res: Response) {
  let { filename, prefix } = req.params;

  filename = Buffer.from(filename, "base64").toString("ascii");
  prefix = Buffer.from(prefix, "base64").toString("ascii");

  const prefixArray = prefix.split("/");
  const type = prefixArray.shift() || prefix;
  const nextPrefix = prefixArray.join("/");

  const validTypes = ["game", "java", "mods"];
  if (!validTypes.includes(type))
    return res.status(400).json({
      success: false,
      error: {
        message: {
          en: "The resource type isnt valid!",
          fr: "Le type de la resource demandee est invalide !",
        },
      },
    });

  const filePath = path.join(
    __dirname,
    "../../public/",
    type,
    nextPrefix,
    filename
  );
  if (!fs.existsSync(filePath))
    return res.status(400).json({
      success: false,
      error: {
        message: {
          en: "The resource doesnt exists!",
          fr: "La resource demandee est inexistante !",
        },
      },
    });

  const authorizedDir = path.join(__dirname, "../../public/", type);
  if (!filePath.includes(authorizedDir))
    return res.status(403).json({
      success: false,
      error: {
        message: {
          en: "You are not allowed to download this resource!",
          fr: "Vous n'etes pas autorise a telecharger cette ressource !",
        },
      },
    });

  res.download(filePath);
}

module.exports = getDownloadFile;
