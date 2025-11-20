export const MOCK_PRODUCTS = [
  { 
    id: 1, 
    name: 'Nike Air Force 1', 
    price: 2500000, 
    category: 'Lifestyle', 
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Huyền thoại sống mãi với thời gian. Nike Air Force 1 mang lại phong cách cổ điển pha lẫn hiện đại. Đế Air êm ái giúp bạn thoải mái cả ngày dài. Chất liệu da cao cấp dễ dàng vệ sinh.',
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ['White', 'Black']
  },
  { 
    id: 2, 
    name: 'Adidas Ultraboost', 
    price: 3200000, 
    category: 'Running', 
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee797455c32?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Đôi giày chạy bộ hoàn hảo với công nghệ đệm Boost phản hồi năng lượng cực tốt. Thân giày Primeknit ôm sát bàn chân, thoáng khí tối đa.',
    sizes: [40, 41, 42, 44],
    colors: ['Grey', 'Blue', 'Black']
  },
  { 
    id: 3, 
    name: 'Jordan 1 High OG', 
    price: 4500000, 
    category: 'Basketball', 
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Biểu tượng của văn hóa sát mặt đất. Thiết kế High-top bảo vệ cổ chân, phối màu OG cực chất dành cho các tín đồ thời trang đường phố.',
    sizes: [41, 42, 43],
    colors: ['Red', 'White']
  },
  { 
    id: 4, 
    name: 'Puma RS-X', 
    price: 1800000, 
    category: 'Lifestyle', 
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'],
    description: 'Phong cách Retro Future độc đáo. Đế giày chunky hầm hố nhưng cực kỳ nhẹ nhàng.',
    sizes: [39, 40, 41],
    colors: ['Multi']
  },
  { 
    id: 5, 
    name: 'New Balance 550', 
    price: 2800000, 
    category: 'Vintage', 
    images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80'],
    description: 'Sự trở lại của dòng giày bóng rổ thập niên 80. Thiết kế đơn giản, tinh tế, dễ phối đồ.',
    sizes: [38, 39, 40, 41, 42],
    colors: ['White', 'Green']
  },
  { 
    id: 6, 
    name: 'Converse Chuck 70', 
    price: 1600000, 
    category: 'Classic', 
    images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80'],
    description: 'Phiên bản nâng cấp của dòng Classic với đế ngà vintage, vải canvas dày dặn hơn và đệm lót êm ái.',
    sizes: [36, 37, 38, 39, 40, 41, 42, 43],
    colors: ['Black', 'Yellow', 'Parchment']
  },
];

export const INITIAL_USERS = [
  { id: 'USER_123', name: 'Nguyen Van A', email: 'nguyenvana@gmail.com', role: 'user', status: 'active', spent: 0, orders: 0, picture: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random' },
  { id: 'ADMIN_001', name: 'Admin User', email: 'admin@store.com', role: 'admin', status: 'active', spent: 0, orders: 0, picture: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff' },
];