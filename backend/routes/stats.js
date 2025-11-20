const express = require("express");
const router = express.Router();
const queryDatabase = require("@mySQLConfig");
const { authenticate, authorizeAdmin } = require("@auth");

router.get("/", authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Thực hiện các query song song cho nhanh
    const [
        totalRevenueRes,
        totalOrdersRes,
        totalProductsRes,
        totalUsersRes
    ] = await Promise.all([
        queryDatabase("SELECT SUM(total) as revenue FROM orders WHERE status != 'cancelled'"),
        queryDatabase("SELECT COUNT(*) as count FROM orders"),
        queryDatabase("SELECT COUNT(*) as count FROM products"),
        queryDatabase("SELECT COUNT(*) as count FROM users")
    ]);

    res.json({
        totalRevenue: totalRevenueRes[0].revenue || 0,
        totalOrders: totalOrdersRes[0].count || 0,
        totalProducts: totalProductsRes[0].count || 0,
        totalUsers: totalUsersRes[0].count || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;