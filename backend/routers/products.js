// thư viện ở đây
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const queryDatabase = require("@mySQLConfig");
const suid = require("@suid");
const getVNDate = require("@dateVN");

// biến ở đây
const router = express.Router();

router.get("/by-category-name/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const response = await queryDatabase(
      `SELECT p.* 
       FROM products p
       JOIN category c ON p.categoryId = c.id
       WHERE c.categoryName LIKE ?`,
      [`%${name}%`] // tìm tương đối
    );
    res.json(response);
  } catch (error) {
    console.error("Error fetching products by category name:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get category list
router.get("/categories", async (req, res) => {
  try {
    const categories = await queryDatabase("SELECT * FROM category");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Thêm category mới
 * Body yêu cầu: { categoryName, description }
 */
router.post("/category", async (req, res) => {
  const { categoryName, description } = req.body;
  if (!categoryName) {
    return res.status(400).json({ error: "categoryName is required" });
  }

  try {
    const id = suid(); // cắt còn 11 ký tự
    await queryDatabase(
      "INSERT INTO category (id, categoryName, description) VALUES (?, ?, ?)",
      [id, categoryName, description || null]
    );
    res.json({ message: "Category added successfully", id });
  } catch (error) {
    console.error("Error inserting category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Hàm lấy số ảnh hiện có trong thư mục (để tiếp tục đếm)
function getCurrentImageCount(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const files = fs.readdirSync(dirPath);
    // Lọc chỉ lấy file ảnh hợp lệ
    const imageFiles = files.filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f));
    return imageFiles.length;
  } catch (e) {
    return 0;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { categoryId, productId } = req.body;
    const uploadPath = path.join(
      __dirname,
      `../storages/${categoryId}/${productId}`
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const { categoryId, productId } = req.body;
    const uploadPath = path.join(
      __dirname,
      `../storages/${categoryId}/${productId}`
    );
    const count = getCurrentImageCount(uploadPath); // đếm số ảnh hiện có
    const ext = path.extname(file.originalname).toLowerCase();

    // Lưu tạm vị trí index vào request nếu chưa có
    if (!req._fileIndex) req._fileIndex = 0;
    req._fileIndex++;

    // Đặt tên tuần tự: 1.jpg, 2.jpg, ...
    const newName = `${count + req._fileIndex}${ext}`;
    cb(null, newName);
  },
});

const upload = multer({ storage });

function prepareProduct(req, res, next) {
  req.body.productId = suid(); // tạo id mới
  next();
}
/**
 * ✅ Thêm product mới và tạo thư mục /storages/<categoryId>/<productId>/
 */
router.post(
  "/product",
  prepareProduct,
  upload.array("files", 10),
  async (req, res) => {
    const { productId, productName, description, categoryId, stock, price } =
      req.body;

    if (!productName || !categoryId) {
      return res
        .status(400)
        .json({ error: "productName and categoryId are required" });
    }

    try {
      // Thêm sản phẩm vào MySQL
      await queryDatabase(
        `INSERT INTO products (id, productName, description, categoryId, stock, price, restockDate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          productName,
          description || null,
          categoryId,
          stock || 0,
          price || 0.0,
          getVNDate(),
        ]
      );

      req.files.map((file) => ({
        name: path.basename(file.filename),
        path: `/storages/${categoryId}/${productId}/${file.filename}`,
        size: file.size,
      }));

      res.json({
        message: "Product added successfully",
      });
    } catch (error) {
      console.error("Error inserting product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/product-list", async (req, res) => {
  try {
    const rows = await queryDatabase(`
      SELECT
        c.id AS categoryId,
        c.categoryName,
        p.id AS productId,
        p.productName,
        p.price
      FROM category c
      LEFT JOIN products p ON c.id = p.categoryId
    `);

    // Gom nhóm theo categoryId
    const response = [];
    const map = new Map();

    for (const row of rows) {
      if (!map.has(row.categoryId)) {
        map.set(row.categoryId, {
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          bannerURL: `/storages/${row.categoryId}/banner/1`,
          products: [],
        });
        response.push(map.get(row.categoryId));
      }

      if (row.productId) {
        map.get(row.categoryId).products.push({
          productId: row.productId,
          productName: row.productName,
          price: Number(row.price).toLocaleString("vi-VN") + "đ",
          url: `/storages/${row.categoryId}/${row.productId}/1.jpg`,
        });
      }
    }

    res.json(response);
  } catch (error) {
    console.error("Error fetching product list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --------------- Cập nhật sản phẩm -----------------

const storageUpdate = multer.diskStorage({
  destination: (req, file, cb) => {
    const { categoryId, productId } = req.body;
    const uploadPath = path.join(
      __dirname,
      `../storages/${categoryId}/${productId}`
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const { categoryId, productId } = req.body;
    const uploadPath = path.join(
      __dirname,
      `../storages/${categoryId}/${productId}`
    );
    const count = getCurrentImageCount(uploadPath); // đếm số ảnh hiện có
    const ext = path.extname(file.originalname).toLowerCase();

    // Lưu tạm vị trí index vào request nếu chưa có
    if (!req._fileIndex) req._fileIndex = 0;
    req._fileIndex++;

    // Đặt tên tuần tự: 1.jpg, 2.jpg, ...
    const newName = `${count + req._fileIndex}${ext}`;
    cb(null, newName);
  },
});

const uploadUpdate = multer({ storage: storageUpdate });
router.post("/update", uploadUpdate.array("files", 10), async (req, res) => {
  const { productId, categoryId, productName, price } = req.body;

  try {
    // cập nhật DB
    await queryDatabase(
      `UPDATE products SET productName=?, price=? WHERE id=?`,
      [productName, price, productId]
    );

    // lưu danh sách ảnh mới
    const uploadedFiles = req.files.map((f) => ({
      fileName: f.filename,
      url: `/storages/${categoryId}/${productId}/${f.filename}`,
    }));

    res.json({
      message: "Cập nhật thành công",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
