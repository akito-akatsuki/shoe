const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

// 1. Cấu hình Multer: Lưu vào bộ nhớ tạm (MemoryStorage) để xử lý bằng Sharp trước khi lưu
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 2. Hàm xử lý ảnh: Cắt vuông và lưu
const processAndSaveImages = async (files) => {
    const processedImages = [];
    const uploadDir = path.join(__dirname, '../storages/imgs');

    // Tạo thư mục nếu chưa có
    await fs.ensureDir(uploadDir);

    for (const file of files) {
        const filename = `prod-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        const filepath = path.join(uploadDir, filename);

        // --- LOGIC SHARP ---
        const image = sharp(file.buffer);
        const metadata = await image.metadata();

        // Tìm cạnh nhỏ nhất để cắt vuông
        const minDimension = Math.min(metadata.width, metadata.height);

        await image
            .extract({ 
                left: Math.floor((metadata.width - minDimension) / 2), 
                top: Math.floor((metadata.height - minDimension) / 2), 
                width: minDimension, 
                height: minDimension 
            })
            .resize(minDimension, minDimension) // Giữ nguyên độ phân giải của cạnh nhỏ nhất
            .jpeg({ quality: 90 }) // Xuất ra JPG chất lượng cao (90%)
            .toFile(filepath);

        // Trả về đường dẫn đầy đủ URL (ví dụ: http://localhost:5000/uploads/abc.jpg)
        // Lưu ý: Trong DB nên lưu đường dẫn tương đối hoặc đầy đủ tùy bạn. 
        // Ở đây tôi lưu đường dẫn tương đối: '/uploads/filename.jpg'
        processedImages.push(`/imgs/${filename}`);
    }

    return processedImages;
};

module.exports.upload = upload;
module.exports.processAndSaveImages = processAndSaveImages;