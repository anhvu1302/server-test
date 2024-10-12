const { rootRouter } = require("./routers");
const bodyParser = require("body-parser");
const compression = require("compression");
const cookieSession = require("cookie-session");
const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const passport = require("./utils/auth/passport");
const path = require("path");
require("dotenv").config();

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];
const app = express();

app.use(compression());
app.use(express.json());
// app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: ["vavshop"],
    maxAge: 24 * 60 * 60 * 100,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

const publicPathDirectory = path.join(__dirname, "public");
app.use("/public", express.static(publicPathDirectory));

app.use("/api/v1", rootRouter);

module.exports = app;
