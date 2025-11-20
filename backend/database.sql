-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS shoe_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shoe_store;

-- 2. Bảng Users (Đã cập nhật thêm cột role và status)
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(11) NOT NULL, -- ID sinh từ nanoid hoặc Google
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `given_name` varchar(100) DEFAULT NULL,
  `family_name` varchar(100) DEFAULT NULL,
  `picture` text DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user', -- Phân quyền: user hoặc admin
  `status` enum('active','locked') DEFAULT 'active', -- Trạng thái tài khoản
  `login_count` int(11) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bảng Products (Sử dụng JSON cho images, sizes, colors)
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,0) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text, -- Mô tả chi tiết
  `images` json DEFAULT NULL, -- Lưu mảng link ảnh: ["url1", "url2"]
  `sizes` json DEFAULT NULL,  -- Lưu mảng size: [39, 40, 41]
  `colors` json DEFAULT NULL, -- Lưu mảng màu: ["Red", "White"]
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bảng Orders (Đơn hàng)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(20) NOT NULL, -- Mã đơn hàng (ví dụ: ORD-123456)
  `user_id` varchar(11) DEFAULT NULL, -- Có thể null nếu là khách vãng lai (nếu muốn)
  `user_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `total` decimal(15,0) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'cod', -- cod, bank
  `status` enum('pending','shipping','delivered','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_orders_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Bảng Order Items (Chi tiết sản phẩm trong đơn hàng)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(20) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(15,0) NOT NULL, -- Giá tại thời điểm mua
  `selected_size` varchar(10) DEFAULT NULL, -- Size khách chọn
  `selected_color` varchar(50) DEFAULT NULL, -- Màu khách chọn
  `image` text, -- Ảnh thumbnail
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --- Dữ liệu mẫu (Optional) ---

-- Thêm 1 Admin mặc định (Bạn cần sửa ID/Email cho khớp với tài khoản Google của bạn để test)
INSERT INTO `users` (`id`, `email`, `name`, `role`, `status`) 
VALUES ('ADMIN_01', 'admin@gmail.com', 'Super Admin', 'admin', 'active')
ON DUPLICATE KEY UPDATE role='admin';

-- Thêm dữ liệu mẫu cho Products
INSERT INTO `products` (`name`, `price`, `category`, `description`, `images`, `sizes`, `colors`) VALUES
('Nike Air Force 1', 2500000, 'Lifestyle', 'Huyền thoại sống mãi với thời gian.', '["https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80"]', '[38, 39, 40, 41, 42, 43]', '["White", "Black"]'),
('Adidas Ultraboost', 3200000, 'Running', 'Đôi giày chạy bộ hoàn hảo.', '["https://images.unsplash.com/photo-1587563871167-1ee797455c32?auto=format&fit=crop&w=600&q=80"]', '[40, 41, 42, 44]', '["Grey", "Blue", "Black"]');