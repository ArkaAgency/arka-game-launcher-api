import express from "express";
import session from "express-session";

import authMicrosoftRoutes from "./routes/auth/microsoft.routes";
import updateLauncherRoutes from "./routes/update/launcher.routes";
import updateGameRoutes from "./routes/update/game.routes";
import updateJavaRoutes from "./routes/update/java.routes";
import downloadRoutes from "./routes/download.routes";

const port = 4004;

const app = express();

// Middle ware to proccess request data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "!S5xa5Yi85RNH3Ys!S5xa5Yi85RNH3Ys!S5xa5Yi85RNH3Ys",
    resave: false,
    saveUninitialized: true,
    cookie: { path: "/", secure: false, httpOnly: false, sameSite: "lax" },
  })
);

// Routes handling
app.use("/auth/microsoft", authMicrosoftRoutes);
app.use("/update/launcher", updateLauncherRoutes);
app.use("/update/game", updateGameRoutes);
app.use("/update/java", updateJavaRoutes);
app.use("/download", downloadRoutes);

// App starting
app.listen(port, () => console.log(`Server is now listening on port ${port}`));
