require("dotenv").config({ path: "./config/config.env" })
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');

const auth = require("./middleware/auth");

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan("tiny"));
app.use(require("cors")());

// Routes
app.use("/api/", require("./routes/auth"));
app.use("/api", require("./routes/contact"));

// Server Configurations
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
    try{
        await connectDB();
        console.log(`Server is listening on PORT; ${PORT}`);
    }catch (err) {
        console.log(err);
    }

});