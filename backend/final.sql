CREATE TABLE `users` (
 `id` varchar(11) NOT NULL,
 `email` varchar(255) NOT NULL,
 `mention` varchar(100) DEFAULT NULL,
 `name` varchar(255) DEFAULT NULL,
 `given_name` varchar(100) DEFAULT NULL,
 `family_name` varchar(100) DEFAULT NULL,
 `picture` text DEFAULT NULL,
 `login_count` int(11) DEFAULT 0,
 `email_verified` tinyint(1) DEFAULT 0,
 `created_at` datetime DEFAULT NULL,
 `updated_at` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `email` (`email`),
 UNIQUE KEY `mention` (`mention`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE category (
  id VARCHAR(11) PRIMARY KEY,
  categoryName VARCHAR(255),
  description TEXT
);

CREATE TABLE products (
  id VARCHAR(11) PRIMARY KEY,
  productName VARCHAR(255),
  description TEXT,
  categoryId VARCHAR(11),
  stock INT,
  price DECIMAL(10,2),
  restockDate DATE,
  FOREIGN KEY (categoryId) REFERENCES category(id)
);

CREATE TABLE shopping_cart (
  id VARCHAR(11) PRIMARY KEY,
  product_id VARCHAR(11),
  user_id VARCHAR(11),
  quantity INT,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



INSERT INTO category (id, categoryName, description) VALUES
('C001', 'Giày thể thao', 'Các loại giày dùng cho hoạt động thể thao thông thường.'),
('C002', 'Sneaker', 'Giày thời trang phong cách trẻ trung, năng động.'),
('C003', 'Giày bóng rổ', 'Giày chuyên dụng cho người chơi bóng rổ.'),
('C004', 'Phụ kiện', 'Phụ kiện kèm theo như dây giày, lót giày, vớ, v.v.');
