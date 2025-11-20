const fs = require("fs");
const path = require("path");

// ---- Nhận file đầu vào qua CLI ----
// VD: node convert-srt.js ./input/movie.srt
const inputPath = process.argv[2];
if (!inputPath) {
  console.error(
    "❌ Vui lòng chỉ định đường dẫn file .srt\nVD: node convert-srt.js ./input/video.srt"
  );
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error("❌ File không tồn tại:", inputPath);
  process.exit(1);
}
// ---- Chuẩn bị đường dẫn output ----
const inputName = path.basename(inputPath, path.extname(inputPath)); // lấy tên gốc
const outputDir = path.join(__dirname, "../storages/output");
const outputPath = path.join(outputDir, `${inputName}.json`);

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ---- Đọc file ----
const content = fs.readFileSync(inputPath, "utf-8");

// ---- Phân tích SRT ----

// Tách block bằng dòng trống
const blocks = content
  .split(/\n\s*\n/)
  .map((b) => b.trim())
  .filter((b) => b);

const result = [];

for (const block of blocks) {
  const lines = block.split("\n").filter(Boolean);
  if (lines.length < 2) continue;

  const id = parseInt(lines[0].trim());
  const timeMatch = lines[1].match(
    /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
  );
  if (!timeMatch) continue;

  const [_, start, end] = timeMatch;

  // Hàm tính duration (s)
  const parseTime = (t) => {
    const [h, m, s] = t.split(":");
    const [sec, ms] = s.split(",");
    return +h * 3600 + +m * 60 + +sec + +ms / 1000;
  };

  const durationSec = (parseTime(end) - parseTime(start)).toFixed(3);

  const original = lines.slice(2).join(" ").trim();

  result.push({
    id,
    start,
    duration: `${durationSec}s`,
    original,
    translated: "",
  });
}

// ---- Ghi ra file JSON ----
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

// console.log(`✅ Chuyển đổi thành công!`);
// console.log(`📂 File lưu tại: ${outputPath}`);
console.log(outputPath);