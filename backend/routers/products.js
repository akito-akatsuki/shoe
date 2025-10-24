const express = require("express");
const queryDatabase = require("../utils/mySQLConfig");

const router = express.Router();

router.get("/products/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const response = await queryDatabase(
      "SELECT * FROM products WHERE category = ?",
      [category]
    );
    res.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
