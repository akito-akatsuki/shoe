require("dotenv").config();
require("module-alias/register");
const express = require("express");
const favicon = require("serve-favicon");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// gọi file trong router
const googleAuthRouter = require("./routers/googleAuth.js");
const products = require("./routers/products.js");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
// app.use(cors({}));
app.use(
  cors({
    origin: ["http://localhost:8080", "https://test.dh74.io.vn"], // đúng port React bạn đang dùng
    credentials: true,
  })
);

// --------- routers ---------

app.use("/auth", googleAuthRouter);
app.use("/products", products);

// --------- page ---------
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/storages", express.static(path.join(__dirname, "storages")));
app.use(
  "/storages",
  express.static(path.join(__dirname, "storages"), {
    maxAge: "1d", // cache 1 ngày
    etag: true, // bật ETag để client chỉ tải lại nếu file đổi
    lastModified: true,
    immutable: false, // nếu bạn muốn file đổi thì reload
  })
);
app.use("/storages", (req, res) => {
  // Lấy đường dẫn sau /storages/
  const relPath = req.path.replace(/^\//, ""); // bỏ dấu / đầu
  const exts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const filename = path.basename(relPath);
  const dirPath = path.join(__dirname, "storages", path.dirname(relPath));

  for (const ext of exts) {
    const filePath = path.join(dirPath, `${filename}${ext}`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }

  return res.status(404).send("File not found");
});

// ====================
// SPA routes hợp lệ
// ====================
const spaRoutes = [
  "/",
  "/auth",
  "/product-manager",
  /^\/product-details(\/.*)?$/,
];

app.get(spaRoutes, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====================
// Các route còn lại → 404.html
// ====================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

// ====================
// Khởi động server
// ====================
app.listen(PORT, () => {
  console.log(`Video server running at http://localhost:${PORT}`);
});
