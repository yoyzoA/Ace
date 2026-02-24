export const mockProducts = [
  {
    _id: 'p1001',
    name: 'Apex Nova 15 Gaming Laptop',
    brand: 'Apex',
    category: 'Laptops',
    price: 1499.99,
    description: 'A balanced 15-inch gaming laptop built for high refresh esports and creator workloads.',
    specs: [
      { label: 'CPU', value: 'Intel Core i7-13700H' },
      { label: 'GPU', value: 'NVIDIA RTX 4070 8GB' },
      { label: 'RAM', value: '16GB DDR5' },
      { label: 'Storage', value: '1TB NVMe SSD' },
      { label: 'Display', value: '15.6 in QHD 165Hz' }
    ],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    stock: 8,
    reserved: 0
  },
  {
    _id: 'p1002',
    name: 'Vertex Pro 17 Creator Laptop',
    brand: 'Vertex',
    category: 'Laptops',
    price: 2199.0,
    description: 'Large screen creator system with fast storage and strong GPU acceleration.',
    specs: [
      { label: 'CPU', value: 'Intel Core i9-13900H' },
      { label: 'GPU', value: 'NVIDIA RTX 4080 12GB' },
      { label: 'RAM', value: '32GB DDR5' },
      { label: 'Storage', value: '2TB NVMe SSD' },
      { label: 'Display', value: '17.3 in 4K 120Hz' }
    ],
    images: [
      'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    stock: 4,
    reserved: 0
  },
  {
    _id: 'p1003',
    name: 'Ionix RTX 4080 Trinity',
    brand: 'Ionix',
    category: 'Graphics Cards',
    price: 1299.0,
    description: 'Triple-fan GPU tuned for quiet thermals and stable boosts at 4K.',
    specs: [
      { label: 'Memory', value: '16GB GDDR6X' },
      { label: 'Boost Clock', value: '2.5 GHz' },
      { label: 'Cooling', value: 'Triple axial' },
      { label: 'Outputs', value: '3x DisplayPort, 1x HDMI' },
      { label: 'Power', value: '320W' }
    ],
    images: [
      'https://images.unsplash.com/photo-1618506469810-282bef2b30a2?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    stock: 6,
    reserved: 0
  },
  {
    _id: 'p1004',
    name: 'Prism 34 Ultrawide Monitor',
    brand: 'Prism',
    category: 'Monitors',
    price: 599.0,
    description: 'Ultra-wide curved display with deep contrast and smooth motion.',
    specs: [
      { label: 'Size', value: '34 in' },
      { label: 'Resolution', value: '3440x1440' },
      { label: 'Refresh', value: '165Hz' },
      { label: 'Panel', value: 'VA' },
      { label: 'Response', value: '1ms MPRT' }
    ],
    images: [
      'https://images.unsplash.com/photo-1510552776732-01acc9a4c7ec?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    stock: 0,
    reserved: 0
  },
  {
    _id: 'p1005',
    name: 'Helix X670 Carbon Motherboard',
    brand: 'Helix',
    category: 'Components',
    price: 329.0,
    description: 'Premium ATX board with strong power delivery and PCIe 5.0 support.',
    specs: [
      { label: 'Socket', value: 'AM5' },
      { label: 'Memory', value: 'DDR5 6600+' },
      { label: 'PCIe', value: '5.0 x16' },
      { label: 'WiFi', value: 'WiFi 6E' },
      { label: 'M.2 Slots', value: '4' }
    ],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    stock: 12,
    reserved: 0
  },
  {
    _id: 'p1006',
    name: 'Nimbus 2TB NVMe SSD',
    brand: 'Nimbus',
    category: 'Storage',
    price: 189.0,
    description: 'High speed PCIe 4.0 storage for game libraries and content creation.',
    specs: [
      { label: 'Capacity', value: '2TB' },
      { label: 'Read', value: '7400 MB/s' },
      { label: 'Write', value: '6500 MB/s' },
      { label: 'Interface', value: 'PCIe 4.0' },
      { label: 'Warranty', value: '5 years' }
    ],
    images: [
      'https://images.unsplash.com/photo-1587202372775-f1f7c1a9ad9f?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    stock: 10,
    reserved: 0
  },
  {
    _id: 'p1007',
    name: 'Vector 850W Modular PSU',
    brand: 'Vector',
    category: 'Components',
    price: 159.0,
    description: 'Efficient power supply with quiet fan curve and fully modular cables.',
    specs: [
      { label: 'Power', value: '850W' },
      { label: 'Efficiency', value: '80 Plus Gold' },
      { label: 'Modular', value: 'Full' },
      { label: 'Fan', value: '135mm' },
      { label: 'Warranty', value: '10 years' }
    ],
    images: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    stock: 7,
    reserved: 0
  },
  {
    _id: 'p1008',
    name: 'PulseFlow 240 AIO Cooler',
    brand: 'PulseFlow',
    category: 'Cooling',
    price: 129.0,
    description: 'Low noise liquid cooling with addressable RGB and a slim radiator.',
    specs: [
      { label: 'Radiator', value: '240mm' },
      { label: 'Fans', value: '2x 120mm' },
      { label: 'Socket', value: 'Intel and AMD' },
      { label: 'Pump', value: 'PWM' },
      { label: 'Noise', value: '28 dBA' }
    ],
    images: [
      'https://images.unsplash.com/photo-1587202372583-493e4c95009b?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    stock: 5,
    reserved: 0
  },
  {
    _id: 'p1009',
    name: 'SignalPro WiFi 7 Router',
    brand: 'SignalPro',
    category: 'Networking',
    price: 349.0,
    description: 'Next generation router built for low latency gaming and multi-gig homes.',
    specs: [
      { label: 'WiFi', value: 'WiFi 7' },
      { label: 'Bands', value: 'Tri-band' },
      { label: 'LAN', value: '2.5G' },
      { label: 'Coverage', value: '3200 sq ft' },
      { label: 'Ports', value: '4' }
    ],
    images: [
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    stock: 9,
    reserved: 0
  },
  {
    _id: 'p1010',
    name: 'ArcLite Mechanical Keyboard',
    brand: 'ArcLite',
    category: 'Accessories',
    price: 129.0,
    description: 'Compact mechanical keyboard with hot swap sockets and clean acoustics.',
    specs: [
      { label: 'Layout', value: '75%' },
      { label: 'Switches', value: 'Linear' },
      { label: 'Backlight', value: 'RGB' },
      { label: 'Connectivity', value: 'USB-C' },
      { label: 'Keycaps', value: 'PBT' }
    ],
    images: [
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    stock: 11,
    reserved: 0
  },
  {
    _id: 'p1011',
    name: 'Drift 7.1 Gaming Headset',
    brand: 'Drift',
    category: 'Accessories',
    price: 89.0,
    description: 'Comfort fit headset with clear positional audio and flip-to-mute mic.',
    specs: [
      { label: 'Audio', value: '7.1 surround' },
      { label: 'Drivers', value: '50mm' },
      { label: 'Mic', value: 'Noise canceling' },
      { label: 'Connectivity', value: 'USB' },
      { label: 'Weight', value: '320g' }
    ],
    images: [
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    stock: 3,
    reserved: 0
  },
  {
    _id: 'p1012',
    name: 'Clarity 27 4K Monitor',
    brand: 'Clarity',
    category: 'Monitors',
    price: 449.0,
    description: 'Color accurate 4K IPS panel for creative work and sharp productivity.',
    specs: [
      { label: 'Size', value: '27 in' },
      { label: 'Resolution', value: '3840x2160' },
      { label: 'Panel', value: 'IPS' },
      { label: 'Color', value: '98% DCI-P3' },
      { label: 'USB-C', value: '65W PD' }
    ],
    images: [
      'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    stock: 6,
    reserved: 0
  }
];
