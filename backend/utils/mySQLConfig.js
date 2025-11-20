const mysql = require("mysql2/promise");

// mySQLConfig.js
require("dotenv").config();

/**
 * Cấu hình kết nối MySQL sử dụng connection pool.
 * @type {mysql.Pool}
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
    connectTimeout: 10000,
    timezone: "+07:00",
    enableKeepAlive: true,
    multipleStatements: true,
});

// Test kết nối
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Đã kết nối đến MySQL:", process.env.DB_NAME);
        connection.release();
    } catch (err) {
        console.error("❌ Lỗi kết nối MySQL:", err);
    }
})();

/**
 * Thực hiện truy vấn SQL với các tham số.
 * @param {string} query - Câu truy vấn SQL.
 * @param {Array} params - Tham số cho câu truy vấn.
 * @return {Promise} Trả về một Promise với kết quả truy vấn.
 */
// function queryDatabase(query, params = []) {
//     return new Promise((resolve, reject) => {
//         pool.query(query, params, (err, results) => {
//             if (err) reject(err);
//             else resolve(results);
//         });
//     });
// }

/**
 * Thực hiện truy vấn SQL với các tham số.
 * @param {string} query - Câu truy vấn SQL.
 * @param {Array} params - Tham số cho câu truy vấn.
 * @return {Promise<Array>} Trả về một Promise với kết quả truy vấn.
 */
async function queryDatabase(query, params = []) {
    try {
        const [rows] = await pool.query(query, params);
        return rows;
    } catch (err) {
        console.error("❌ Query error:", err);
        throw err;
    }
}

// (async () => {
//     const result = await queryDatabase("SELECT 1");
//     console.log("✅ Kết quả:", result);
// })();


module.exports = queryDatabase;
module.exports.pool = pool;