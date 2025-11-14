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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci

CREATE TABLE `category` (
 `id` varchar(11) NOT NULL,
 `categoryName` varchar(255) DEFAULT NULL,
 `description` text DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `unique_category_name` (`categoryName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci


CREATE TABLE `products` (
 `id` varchar(11) NOT NULL,
 `productName` varchar(255) DEFAULT NULL,
 `description` text DEFAULT NULL,
 `categoryId` varchar(11) DEFAULT NULL,
 `stock` int(11) DEFAULT NULL,
 `price` decimal(10,2) DEFAULT NULL,
 `restockDate` date DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `categoryId` (`categoryId`),
 CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci

CREATE TABLE `shopping_cart` (
 `id` varchar(11) NOT NULL,
 `product_id` varchar(11) DEFAULT NULL,
 `user_id` varchar(11) DEFAULT NULL,
 `quantity` int(11) DEFAULT NULL,
 `added_at` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
 KEY `product_id` (`product_id`),
 CONSTRAINT `shopping_cart_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
 CONSTRAINT `shopping_cart_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci

CREATE TABLE `orders` (
  `id` varchar(11) NOT NULL,
  `customerName` varchar(255),
  `customerPhone` varchar(50),
  `productId` varchar(11),
  `quantity` int,
  `unitPrice` decimal(10,2),
  `total` decimal(10,2),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


SHOW CREATE TABLE users;
SHOW CREATE TABLE shopping_cart;
SHOW CREATE TABLE products;
SHOW CREATE TABLE category;
