const express = require("express");
const session = require("express-session");
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
app.use("/auth/microsoft", require("./routes/auth/microsoft.routes"));
app.use("/update/launcher", require("./routes/update/launcher.routes"));
app.use("/update/game", require("./routes/update/game.routes"));
app.use("/update/mods", require("./routes/update/mods.routes"));
app.use("/update/java", require("./routes/update/java.routes"));
app.use("/download", require("./routes/download.routes"));

// App starting
app.listen(port, () => console.log(`Server is now listening on port ${port}`));
