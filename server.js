// Import dotenv & configuration
require('dotenv').config();

// Fundamental
const { MongoClient } = require("mongodb");
const express = require("express");
const PORT = process.env.PORT;
const app = express();

// NodeMailer
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { oauth2 } = require("googleapis/build/src/apis/oauth2");
const { gmail } = require("googleapis/build/src/apis/gmail");
const OAuth2 = google.auth.OAuth2;
const OAuth2_client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
OAuth2_client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Middleware
app.use("/assets/html", express.static("./assets/html"));
app.use("/assets/css", express.static("./assets/css"));
app.use("/assets/img", express.static("./assets/img"));
app.use("/assets/js", express.static("./assets/js"));
app.use(express.json());

// Elements
let database;

// MongoDB Connection
const client = new MongoClient(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  database = client.db("subscribe").collection("user");
  if (err) return console.log("err...", err);
  init();
});

// Init
function init() {
  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  app.post("/", (req, res) => {
    let userEmail = req.body.email;

    //Check Email Duplication on DB
    if (req.body.checkbox !== undefined) {
      database.count({ email: userEmail }, (err, count) => {
        if (err) {
          console.log("Database count error... ", err);
          res.status(500).json({ message: "Database Error" });
          database.close();
        }
        if (!count) {
          addEmail(userEmail);
        }
      });
    } else {
      console.log("User already subscribed");
    }

    sendMail(
      req.body.userName,
      req.body.email,
      req.body.subject,
      req.body.message,
      res
    );
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
  });
}

// function list
function addEmail(email) {
  database.insertOne({ _id: Date.now(), email: email }).catch((err) => {
    return console.log("DB insert err...", err);
  });
  return console.log("db updated!");
}

function removeEmail(email) {
  database.remove();
}

async function sendMail(userName, userEmail, subject, message, res) {
  const accessToken = await OAuth2_client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.user,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const mail_options = {
    from: "Contact Bot",
    to: "fopam16866@timevod.com",
    subject: subject,
    text: `${userEmail}  ${message}`,
  };

  transport.sendMail(mail_options, (err, result) => {
    if (err) {
      console.log(err);
      res.status(501).json({ message: "Error occured while sending email" });
    }
    transport.close();
    res.status(200).json({ title : "Message sent!", message : "We will get in touch with you as soon as possible"});
    console.log("Response sent");
  });
}
