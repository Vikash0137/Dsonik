const Product = require('../models/Product');

const DEMO_PRODUCTS = [
  {
    name: 'Ultrasonic Plastic Welding Machine',
    slug: 'ultrasonic-plastic-welding-machine',
    shortDescription: 'High-precision welding machine designed for superior joint quality and repeatable industrial performance.',
    description: 'A premium industrial welding machine for manufacturing lines that demand repeatability and strength.',
    price: 420000,
    discountPrice: 390000,
    images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80'],
    stock: 6,
    isFeatured: true,
    status: 'active',
  },
  {
    name: 'Ultrasonic Horn Fixture',
    slug: 'ultrasonic-horn-fixture',
    shortDescription: 'Robust fixture assembly for accurate horn positioning and consistent welding output.',
    description: 'Precision horn fixtures built for stable alignment and dependable long-term use in production environments.',
    price: 180000,
    discountPrice: 165000,
    images: ['https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80'],
    stock: 4,
    isFeatured: true,
    status: 'active',
  },
  {
    name: 'Ultrasonic Converter & Booster',
    slug: 'ultrasonic-converter-booster',
    shortDescription: 'Reliable converter and booster package optimized for premium welding efficiency.',
    description: 'A dependable converter and booster system for professional ultrasonic welding applications.',
    price: 260000,
    discountPrice: 240000,
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'],
    stock: 8,
    isFeatured: true,
    status: 'active',
  },
];

exports.listProducts = async (req, res) => {
  const q = req.query.q || '';
  const filter = q ? { name: new RegExp(q, 'i') } : {};

  try {
    const existingProducts = await Product.find(filter).limit(50);
    if (existingProducts.length > 0) {
      return res.json(existingProducts);
    }

    const seededProducts = await Product.create(DEMO_PRODUCTS);
    return res.json(seededProducts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  const slug = req.params.slug;
  const p = await Product.findOne({ slug });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
};
