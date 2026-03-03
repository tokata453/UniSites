'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('products', [
      // Smartphones
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system. Features include Dynamic Island, Always-On display, and Action button.',
        price: 999.99,
        salePrice: 899.99,
        sku: 'APL-IPH15P-256-TIT',
        stock: 45,
        categoryId: 1,
        images: JSON.stringify([
          "products/1771823653787-835196845.jpg",
          "products/1771823653788-249468487.jpg",
          "products/1771823653789-937846911.jpg"
        ]),
        badge: 'Hot',
        specifications: JSON.stringify({
          display: '6.1-inch Super Retina XDR',
          processor: 'A17 Pro chip',
          ram: '8GB',
          storage: '256GB',
          camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
          battery: 'Up to 23 hours video playback',
          weight: '187g'
        }),
        isActive: true,
        isFeatured: true,
        views: 2847,
        rating: 4.8,
        reviewCount: 234,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        description: 'Premium Android flagship with built-in S Pen, incredible AI features, and stunning 200MP camera. Perfect for power users and creative professionals.',
        price: 1199.99,
        salePrice: null,
        sku: 'SAM-S24U-512-BLK',
        stock: 32,
        categoryId: 1,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'New',
        specifications: JSON.stringify({
          display: '6.8-inch Dynamic AMOLED 2X',
          processor: 'Snapdragon 8 Gen 3',
          ram: '12GB',
          storage: '512GB',
          camera: '200MP Wide + 12MP Ultra Wide + 50MP Telephoto + 10MP Telephoto',
          battery: '5000mAh',
          weight: '232g'
        }),
        isActive: true,
        isFeatured: true,
        views: 1923,
        rating: 4.7,
        reviewCount: 156,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Google Pixel 8 Pro',
        slug: 'google-pixel-8-pro',
        description: 'Google\'s flagship with incredible AI photography, pure Android experience, and 7 years of updates. Best-in-class camera powered by Google Tensor G3.',
        price: 899.99,
        salePrice: 799.99,
        sku: 'GOO-PX8P-256-POR',
        stock: 28,
        categoryId: 1,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Sale',
        specifications: JSON.stringify({
          display: '6.7-inch LTPO OLED',
          processor: 'Google Tensor G3',
          ram: '12GB',
          storage: '256GB',
          camera: '50MP Wide + 48MP Ultra Wide + 48MP Telephoto',
          battery: '5050mAh',
          weight: '213g'
        }),
        isActive: true,
        isFeatured: false,
        views: 1456,
        rating: 4.6,
        reviewCount: 98,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'OnePlus 12',
        slug: 'oneplus-12',
        description: 'Flagship killer with Snapdragon 8 Gen 3, ultra-fast 100W charging, and Hasselblad camera system. Exceptional value for performance enthusiasts.',
        price: 799.99,
        salePrice: 749.99,
        sku: 'ONP-OP12-256-GRN',
        stock: 40,
        categoryId: 1,
        images: JSON.stringify([
          "products/1771823653787-835196845.jpg",
          "products/1771823653788-249468487.jpg",
          "products/1771823653789-937846911.jpg"
        ]),
        badge: 'Hot',
        specifications: JSON.stringify({
          display: '6.82-inch AMOLED',
          processor: 'Snapdragon 8 Gen 3',
          ram: '16GB',
          storage: '256GB',
          camera: '50MP + 48MP + 64MP Hasselblad',
          battery: '5400mAh with 100W charging',
          weight: '220g'
        }),
        isActive: true,
        isFeatured: true,
        views: 1234,
        rating: 4.5,
        reviewCount: 87,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Laptops
      {
        name: 'MacBook Pro 16" M3 Pro',
        slug: 'macbook-pro-16-m3-pro',
        description: 'Supercharged for professionals with M3 Pro chip, stunning Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for developers and creators.',
        price: 2499.99,
        salePrice: 2299.99,
        sku: 'APL-MBP16-M3P-36-1TB',
        stock: 18,
        categoryId: 2,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Featured',
        specifications: JSON.stringify({
          display: '16.2-inch Liquid Retina XDR',
          processor: 'Apple M3 Pro (12-core CPU, 18-core GPU)',
          ram: '36GB Unified Memory',
          storage: '1TB SSD',
          battery: 'Up to 22 hours',
          ports: '3x Thunderbolt 4, HDMI, SD card, MagSafe 3',
          weight: '2.16kg'
        }),
        isActive: true,
        isFeatured: true,
        views: 3421,
        rating: 4.9,
        reviewCount: 312,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        description: 'Premium Windows laptop with stunning InfinityEdge display, powerful Intel processor, and NVIDIA graphics. The ultimate productivity machine.',
        price: 1899.99,
        salePrice: null,
        sku: 'DEL-XPS15-I9-32-1TB',
        stock: 22,
        categoryId: 2,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'New',
        specifications: JSON.stringify({
          display: '15.6-inch 4K OLED Touch',
          processor: 'Intel Core i9-13900H',
          ram: '32GB DDR5',
          storage: '1TB NVMe SSD',
          graphics: 'NVIDIA GeForce RTX 4060',
          battery: 'Up to 13 hours',
          weight: '1.86kg'
        }),
        isActive: true,
        isFeatured: false,
        views: 1876,
        rating: 4.6,
        reviewCount: 145,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ASUS ROG Zephyrus G14',
        slug: 'asus-rog-zephyrus-g14',
        description: 'Compact gaming powerhouse with AMD Ryzen 9, NVIDIA RTX 4060, and incredible battery life. Game anywhere with style.',
        price: 1599.99,
        salePrice: 1449.99,
        sku: 'ASU-ROGG14-R9-16-1TB',
        stock: 15,
        categoryId: 2,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Sale',
        specifications: JSON.stringify({
          display: '14-inch QHD+ 120Hz',
          processor: 'AMD Ryzen 9 7940HS',
          ram: '16GB DDR5',
          storage: '1TB NVMe SSD',
          graphics: 'NVIDIA GeForce RTX 4060',
          battery: 'Up to 10 hours',
          weight: '1.65kg'
        }),
        isActive: true,
        isFeatured: true,
        views: 2134,
        rating: 4.7,
        reviewCount: 189,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        slug: 'lenovo-thinkpad-x1-carbon-gen-11',
        description: 'Business ultrabook with legendary ThinkPad keyboard, military-grade durability, and all-day battery. The professional\'s choice.',
        price: 1699.99,
        salePrice: null,
        sku: 'LEN-X1C11-I7-16-512',
        stock: 20,
        categoryId: 2,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: null,
        specifications: JSON.stringify({
          display: '14-inch 2.8K OLED Touch',
          processor: 'Intel Core i7-1365U',
          ram: '16GB LPDDR5',
          storage: '512GB NVMe SSD',
          battery: 'Up to 19.5 hours',
          ports: '2x Thunderbolt 4, 2x USB-A, HDMI',
          weight: '1.12kg'
        }),
        isActive: true,
        isFeatured: false,
        views: 1234,
        rating: 4.8,
        reviewCount: 176,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Tablets
      {
        name: 'iPad Pro 12.9" M2',
        slug: 'ipad-pro-12-9-m2',
        description: 'The ultimate iPad experience with M2 chip, stunning Liquid Retina XDR display, and support for Apple Pencil hover. Desktop-class performance in a tablet.',
        price: 1099.99,
        salePrice: 999.99,
        sku: 'APL-IPADP129-M2-256',
        stock: 35,
        categoryId: 3,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Sale',
        specifications: JSON.stringify({
          display: '12.9-inch Liquid Retina XDR',
          processor: 'Apple M2',
          ram: '8GB',
          storage: '256GB',
          camera: '12MP Wide + 10MP Ultra Wide',
          battery: 'Up to 10 hours',
          weight: '682g'
        }),
        isActive: true,
        isFeatured: true,
        views: 1876,
        rating: 4.8,
        reviewCount: 234,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Samsung Galaxy Tab S9 Ultra',
        slug: 'samsung-galaxy-tab-s9-ultra',
        description: 'Massive 14.6-inch AMOLED display, included S Pen, and powerful Snapdragon processor. The ultimate Android tablet for productivity and entertainment.',
        price: 1199.99,
        salePrice: null,
        sku: 'SAM-TABS9U-512-GRY',
        stock: 18,
        categoryId: 3,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'New',
        specifications: JSON.stringify({
          display: '14.6-inch Dynamic AMOLED 2X',
          processor: 'Snapdragon 8 Gen 2',
          ram: '12GB',
          storage: '512GB',
          camera: '13MP + 8MP Ultra Wide',
          battery: '11200mAh',
          weight: '732g'
        }),
        isActive: true,
        isFeatured: false,
        views: 987,
        rating: 4.6,
        reviewCount: 89,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Microsoft Surface Pro 9',
        slug: 'microsoft-surface-pro-9',
        description: 'Versatile 2-in-1 that\'s both tablet and laptop. Runs full Windows 11, perfect for business and creative work.',
        price: 999.99,
        salePrice: 899.99,
        sku: 'MSF-SP9-I5-16-256',
        stock: 25,
        categoryId: 3,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Hot',
        specifications: JSON.stringify({
          display: '13-inch PixelSense Flow Touch',
          processor: 'Intel Core i5-1235U',
          ram: '16GB',
          storage: '256GB SSD',
          battery: 'Up to 15.5 hours',
          weight: '879g'
        }),
        isActive: true,
        isFeatured: true,
        views: 1456,
        rating: 4.5,
        reviewCount: 134,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Headphones
      {
        name: 'AirPods Pro (2nd Generation)',
        slug: 'airpods-pro-2nd-gen',
        description: 'Premium wireless earbuds with active noise cancellation, adaptive transparency, and personalized spatial audio. Up to 2x more noise cancellation.',
        price: 249.99,
        salePrice: null,
        sku: 'APL-APP2-USBC',
        stock: 120,
        categoryId: 4,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Hot',
        specifications: JSON.stringify({
          type: 'In-ear',
          connectivity: 'Bluetooth 5.3',
          features: 'Active Noise Cancellation, Adaptive Transparency, Spatial Audio',
          battery: 'Up to 6 hours (ANC on), 30 hours with case',
          water_resistance: 'IPX4',
          weight: '5.3g per earbud'
        }),
        isActive: true,
        isFeatured: true,
        views: 3421,
        rating: 4.8,
        reviewCount: 567,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        description: 'Industry-leading noise cancellation, exceptional sound quality, and premium comfort. The best over-ear headphones for travelers and audiophiles.',
        price: 399.99,
        salePrice: 349.99,
        sku: 'SNY-WH1000XM5-BLK',
        stock: 45,
        categoryId: 4,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Sale',
        specifications: JSON.stringify({
          type: 'Over-ear',
          connectivity: 'Bluetooth 5.2, LDAC, multipoint',
          features: 'Industry-leading ANC, Speak-to-Chat, Adaptive Sound Control',
          battery: 'Up to 30 hours (ANC on), 40 hours (ANC off)',
          weight: '250g'
        }),
        isActive: true,
        isFeatured: true,
        views: 2134,
        rating: 4.9,
        reviewCount: 489,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bose QuietComfort Ultra Earbuds',
        slug: 'bose-qc-ultra-earbuds',
        description: 'Breakthrough spatial audio with Bose Immersive Audio, world-class noise cancellation, and all-day comfort.',
        price: 299.99,
        salePrice: null,
        sku: 'BOS-QCUE-BLK',
        stock: 55,
        categoryId: 4,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'New',
        specifications: JSON.stringify({
          type: 'In-ear',
          connectivity: 'Bluetooth 5.3',
          features: 'Immersive Audio, CustomTune, World-class ANC',
          battery: 'Up to 6 hours, 24 hours with case',
          water_resistance: 'IPX4',
          weight: '6.24g per earbud'
        }),
        isActive: true,
        isFeatured: false,
        views: 1234,
        rating: 4.7,
        reviewCount: 178,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Smartwatches
      {
        name: 'Apple Watch Series 9',
        slug: 'apple-watch-series-9',
        description: 'Advanced health and fitness features with a brilliant Always-On Retina display. Double tap gesture and precise Find My iPhone.',
        price: 399.99,
        salePrice: 349.99,
        sku: 'APL-AW9-45-GPS-BLK',
        stock: 70,
        categoryId: 5,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Sale',
        specifications: JSON.stringify({
          display: '45mm Always-On Retina LTPO OLED',
          processor: 'S9 SiP',
          sensors: 'Blood Oxygen, ECG, Heart Rate, Temperature',
          battery: 'Up to 18 hours',
          water_resistance: '50m',
          connectivity: 'GPS + Cellular option'
        }),
        isActive: true,
        isFeatured: true,
        views: 2345,
        rating: 4.8,
        reviewCount: 345,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Samsung Galaxy Watch 6 Classic',
        slug: 'samsung-galaxy-watch-6-classic',
        description: 'Premium Android smartwatch with rotating bezel, comprehensive health tracking, and long battery life. Perfect companion for Galaxy phones.',
        price: 399.99,
        salePrice: null,
        sku: 'SAM-GW6C-43-BLK',
        stock: 40,
        categoryId: 5,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: null,
        specifications: JSON.stringify({
          display: '43mm Super AMOLED',
          processor: 'Exynos W930',
          sensors: 'BIA, ECG, Blood Pressure, Sleep tracking',
          battery: 'Up to 40 hours',
          water_resistance: '5ATM + IP68',
          compatibility: 'Android'
        }),
        isActive: true,
        isFeatured: false,
        views: 1456,
        rating: 4.6,
        reviewCount: 198,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Garmin Fenix 7X Sapphire Solar',
        slug: 'garmin-fenix-7x-sapphire-solar',
        description: 'Ultimate multisport GPS watch with solar charging, built for serious athletes and outdoor enthusiasts. Weeks of battery life.',
        price: 899.99,
        salePrice: 799.99,
        sku: 'GAR-F7X-SAP-SOL',
        stock: 15,
        categoryId: 5,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Featured',
        specifications: JSON.stringify({
          display: '1.4-inch MIP touchscreen',
          battery: 'Up to 37 days (solar), 21 days (GPS)',
          features: 'Multi-band GPS, TopoActive maps, Training features',
          sensors: 'Heart rate, Pulse Ox, Compass, Altimeter',
          water_resistance: '10ATM',
          weight: '89g'
        }),
        isActive: true,
        isFeatured: true,
        views: 876,
        rating: 4.9,
        reviewCount: 234,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Accessories
      {
        name: 'Anker 737 Power Bank',
        slug: 'anker-737-power-bank',
        description: '24,000mAh portable charger with 140W output. Charge laptops, phones, and tablets simultaneously at maximum speed.',
        price: 149.99,
        salePrice: 129.99,
        sku: 'ANK-737-24K-BLK',
        stock: 85,
        categoryId: 6,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: 'Hot',
        specifications: JSON.stringify({
          capacity: '24,000mAh (86.4Wh)',
          output: '140W max (USB-C)',
          ports: '2x USB-C, 1x USB-A',
          charging_time: '1.2 hours (140W charger)',
          weight: '615g'
        }),
        isActive: true,
        isFeatured: false,
        views: 1987,
        rating: 4.7,
        reviewCount: 456,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Apple MagSafe Charger',
        slug: 'apple-magsafe-charger',
        description: 'Official MagSafe wireless charger for iPhone. Perfectly aligned magnets provide faster wireless charging up to 15W.',
        price: 39.99,
        salePrice: null,
        sku: 'APL-MAGSAFE-WHT',
        stock: 200,
        categoryId: 6,
        images: JSON.stringify([
          "products/1771823765095-889899532.jpg",
          "products/1771823765100-897889707.jpg",
          "products/1771823765100-913397543.jpg"
        ]),
        badge: null,
        specifications: JSON.stringify({
          output: 'Up to 15W',
          compatibility: 'iPhone 12 and later',
          cable_length: '1m USB-C',
          features: 'Magnetic alignment, Qi compatible'
        }),
        isActive: true,
        isFeatured: false,
        views: 3421,
        rating: 4.5,
        reviewCount: 789,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ 20 realistic products created across 6 categories');
    console.log('   - 4 Smartphones');
    console.log('   - 4 Laptops');
    console.log('   - 3 Tablets');
    console.log('   - 3 Headphones');
    console.log('   - 3 Smartwatches');
    console.log('   - 3 Accessories');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
  }
};
