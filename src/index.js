const express = require('express');
const port = 4004;

const app = express();

// Middle ware to proccess request data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes handling
app.use('/update/game', require('./routes/update/game.routes'));
app.use('/update/mods', require('./routes/update/mods.routes'));
app.use('/update/java', require('./routes/update/java.routes'));
app.use('/download', require('./routes/download.routes'));

// App starting
app.listen(port, () => console.log(`Server is now listening on port ${port}`));