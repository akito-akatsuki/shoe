require("dotenv").config();
const express = require("express");
const favicon = require("serve-favicon");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// --------- routers ---------
const googleAuthRouter = require("./routers/googleAuth.js");
const productsRouter = require("./routers/products.js");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors({}));

// --------- routers ---------

app.use("/auth", googleAuthRouter);
app.use("/", productsRouter);

// --------- page ---------
app.use("/storages", express.static(path.join(__dirname, "storages")));
app.get("/storages/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "storages", filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.listen(PORT, () => {
  console.log(`Video server running at http://localhost:${PORT}`);
});
