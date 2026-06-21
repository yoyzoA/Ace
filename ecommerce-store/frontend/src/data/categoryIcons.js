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
  LayoutGrid
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
  Toys: ToyBrick
};

export const getCategoryIcon = (category) => categoryIcons[category] || LayoutGrid;
