const express = require("express"),
  bodyParser = require("body-parser"),
  path = require("path"),
  app = express(),
  port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Welcome to the server! Use /api for API endpoints.");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
