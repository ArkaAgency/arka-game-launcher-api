import express from "express";
const router = express.Router();
const getJavaData = require("../../controllers/update/java.controller");

router.get("/:platform/", getJavaData);

export default router;
