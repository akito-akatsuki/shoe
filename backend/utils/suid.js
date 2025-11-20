// **suid.js** = Snowflake-like Unique ID

const EPOCH = 1700000000000n; // Mốc thời gian tuỳ chọn (2023-11-14)
let lastTimestamp = 0n;
let sequence = 0n;

// ===== Sinh ID Snowflake-like (64-bit, có thứ tự) =====
function generateSuid(workerId = 1n, datacenterId = 1n) {
  const timestamp = BigInt(Date.now());

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & 0xfffn; // 12-bit sequence
    if (sequence === 0n) {
      while (BigInt(Date.now()) <= lastTimestamp) {} // chờ tới ms tiếp theo
    }
  } else sequence = 0n;

  lastTimestamp = timestamp;

  return (
    ((timestamp - EPOCH) << 22n) |
    (datacenterId << 17n) |
    (workerId << 12n) |
    sequence
  );
}

// ===== Chuyển sang chuỗi ngắn Base64URL (kiểu YouTube) =====
function toBase64URL(num) {
  let hex = num.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const buffer = Buffer.from(hex, "hex");
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
    .slice(0, 11); // 11 ký tự như YouTube ID
}

// ===== Hàm tạo ID chuỗi =====
function suid() {
  return toBase64URL(generateSuid());
}

module.exports = suid;
module.exports.toBase64URL = toBase64URL;
