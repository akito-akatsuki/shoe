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

INSERT INTO category (id, categoryName, description) VALUES
('C001', 'Giày thể thao', 'Các loại giày dùng cho hoạt động thể thao thông thường.'),
('C002', 'Sneaker', 'Giày thời trang phong cách trẻ trung, năng động.'),
('C003', 'Giày bóng rổ', 'Giày chuyên dụng cho người chơi bóng rổ.'),
('C004', 'Phụ kiện', 'Phụ kiện kèm theo như dây giày, lót giày, vớ, v.v.');
