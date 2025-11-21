const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const routes  = require("./routes/index");
const ajax = require("./routes/ajax/index");
const tfa = require("./routes/tfa");
const expressSession = require("express-session");
const passport = require("passport");

// ENV variables
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/node2fa";
const PORT = process.env.PORT || 5000;

// Configure app
app.set("view engine", "ejs");

// middlewares
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Express Session
app.use(expressSession({
    secret: "a4f8542071f-c33873-443447-8ee2321",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Mongoose recommended options (removes warnings)
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log("📌 Database URL:", DATABASE_URL);

    app.listen(PORT, () => {
        console.log("🚀 Server is running");
        console.log(`👉 Open in browser: http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
});

app.use(routes);
app.use(ajax);
app.use(tfa);
