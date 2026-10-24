import {
  Laptop,
  Cpu,
  Monitor,
  Gamepad2,
  MousePointer2,
  Cable,
  Wifi,
  Printer,
  Headphones,
  ShieldCheck,
  HardDrive,
  Tablet,
  Sparkles,
  Watch,
  Home,
  Briefcase,
  Wrench,
  ToyBrick,
  LayoutGrid,
  Fan
} from 'lucide-react';

export const categoryIcons = {
  Laptops: Laptop,
  'Computer Components': Cpu,
  'Monitors & Displays': Monitor,
  Gaming: Gamepad2,
  Accessories: MousePointer2,
  'Cables & Adapters': Cable,
  Networking: Wifi,
  'Printers & Supplies': Printer,
  Audio: Headphones,
  'Security & Surveillance': ShieldCheck,
  Storage: HardDrive,
  Tablets: Tablet,
  'Gadgets & Electronics': Sparkles,
  Wearables: Watch,
  'Smart Home': Home,
  'Office & Media': Briefcase,
  'Tools & Mobility': Wrench,
  Toys: ToyBrick,
  // Shorter category names used in some data sets
  Components: Cpu,
  'Graphics Cards': Cpu,
  Monitors: Monitor,
  Cooling: Fan,
  Peripherals: MousePointer2,
  Printers: Printer
};

export const getCategoryIcon = (category) => categoryIcons[category] || LayoutGrid;
