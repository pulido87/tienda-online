import { Product, DeliveryZone, Combo } from './types';

export const initialProducts: Product[] = [
  { id: '1', name: 'Arroz suelto', description: 'Arroz de grano largo, calidad premium', category: 'alimentos', priceCUP: 250, priceMLC: 0.85, unit: 'libra', stock: 100, minStock: 10, imageUrl: '', isFeatured: true, isActive: true, salesCount: 45 },
  { id: '2', name: 'Frijoles negros', description: 'Frijoles negros nacionales seleccionados', category: 'alimentos', priceCUP: 300, priceMLC: 1.00, unit: 'libra', stock: 80, minStock: 10, imageUrl: '', isFeatured: true, isActive: true, salesCount: 38 },
  { id: '3', name: 'Aceite de soya', description: 'Aceite vegetal de soya 1 litro', category: 'alimentos', priceCUP: 800, priceMLC: 2.70, unit: 'litro', stock: 50, minStock: 5, imageUrl: '', isFeatured: true, isActive: true, salesCount: 32 },
  { id: '4', name: 'Azúcar refino', description: 'Azúcar blanca refino nacional', category: 'alimentos', priceCUP: 200, priceMLC: 0.70, unit: 'libra', stock: 120, minStock: 15, imageUrl: '', isFeatured: false, isActive: true, salesCount: 28 },
  { id: '5', name: 'Pollo troceado', description: 'Pollo troceado importado congelado', category: 'alimentos', priceCUP: 1200, priceMLC: 4.00, unit: 'kg', stock: 30, minStock: 5, imageUrl: '', isFeatured: true, isActive: true, salesCount: 52 },
  { id: '6', name: 'Salchichas', description: 'Salchichas de pollo 500g', category: 'alimentos', priceCUP: 600, priceMLC: 2.00, unit: 'paquete', stock: 45, minStock: 8, imageUrl: '', isFeatured: false, isActive: true, salesCount: 22 },
  { id: '7', name: 'Espaguetis', description: 'Pasta espagueti 500g', category: 'alimentos', priceCUP: 350, priceMLC: 1.20, unit: 'paquete', stock: 60, minStock: 10, imageUrl: '', isFeatured: false, isActive: true, salesCount: 18 },
  { id: '8', name: 'Cerveza Cristal', description: 'Cerveza Cristal lata 355ml', category: 'cervezas', priceCUP: 250, priceMLC: 0.85, unit: 'unidad', stock: 200, minStock: 20, imageUrl: '', isFeatured: true, isActive: true, salesCount: 89 },
  { id: '9', name: 'Cerveza Bucanero', description: 'Cerveza Bucanero lata 355ml', category: 'cervezas', priceCUP: 280, priceMLC: 0.95, unit: 'unidad', stock: 180, minStock: 20, imageUrl: '', isFeatured: true, isActive: true, salesCount: 76 },
  { id: '10', name: 'Cerveza Presidente', description: 'Cerveza Presidente importada 355ml', category: 'cervezas', priceCUP: 350, priceMLC: 1.20, unit: 'unidad', stock: 100, minStock: 10, imageUrl: '', isFeatured: false, isActive: true, salesCount: 34 },
  { id: '11', name: 'Malta Bucanero', description: 'Malta Bucanero lata 355ml', category: 'refrescos', priceCUP: 200, priceMLC: 0.70, unit: 'unidad', stock: 150, minStock: 15, imageUrl: '', isFeatured: false, isActive: true, salesCount: 25 },
  { id: '12', name: 'Refresco Cola', description: 'Refresco de cola nacional 500ml', category: 'refrescos', priceCUP: 180, priceMLC: 0.60, unit: 'unidad', stock: 100, minStock: 15, imageUrl: '', isFeatured: false, isActive: true, salesCount: 20 },
  { id: '13', name: 'Jugo de mango', description: 'Jugo natural de mango 1 litro', category: 'refrescos', priceCUP: 350, priceMLC: 1.20, unit: 'litro', stock: 40, minStock: 5, imageUrl: '', isFeatured: true, isActive: true, salesCount: 30 },
  { id: '14', name: 'Agua mineral', description: 'Agua mineral Ciego Montero 500ml', category: 'refrescos', priceCUP: 100, priceMLC: 0.35, unit: 'unidad', stock: 200, minStock: 20, imageUrl: '', isFeatured: false, isActive: true, salesCount: 15 },
  { id: '15', name: 'Detergente líquido', description: 'Detergente multiusos 1 litro', category: 'aseo', priceCUP: 500, priceMLC: 1.70, unit: 'litro', stock: 60, minStock: 8, imageUrl: '', isFeatured: false, isActive: true, salesCount: 19 },
  { id: '16', name: 'Jabón de baño', description: 'Jabón de tocador perfumado', category: 'aseo', priceCUP: 150, priceMLC: 0.50, unit: 'unidad', stock: 100, minStock: 10, imageUrl: '', isFeatured: false, isActive: true, salesCount: 14 },
  { id: '17', name: 'Pasta dental', description: 'Pasta dental con flúor 100ml', category: 'aseo', priceCUP: 300, priceMLC: 1.00, unit: 'unidad', stock: 70, minStock: 8, imageUrl: '', isFeatured: true, isActive: true, salesCount: 23 },
  { id: '18', name: 'Papel higiénico', description: 'Papel higiénico doble hoja x4', category: 'aseo', priceCUP: 400, priceMLC: 1.35, unit: 'paquete', stock: 90, minStock: 10, imageUrl: '', isFeatured: false, isActive: true, salesCount: 27 },
];

export const initialCombos: Combo[] = [
  { id: 'c1', name: 'Combo Básico', description: 'Lo esencial para tu hogar', priceCUP: 1500, priceMLC: 5.00, savingsCUP: 350, items: ['Arroz 5 lb', 'Frijoles 2 lb', 'Aceite 1L', 'Azúcar 2 lb'], imageUrl: '' },
  { id: 'c2', name: 'Combo Fiesta', description: 'Para celebrar en grande', priceCUP: 2800, priceMLC: 9.50, savingsCUP: 520, items: ['Cerveza Cristal x12', 'Refresco Cola x6', 'Salchichas x2'], imageUrl: '' },
  { id: 'c3', name: 'Combo Familiar', description: 'Alimenta a toda la familia', priceCUP: 3500, priceMLC: 11.70, savingsCUP: 700, items: ['Pollo 2kg', 'Arroz 10 lb', 'Frijoles 4 lb', 'Aceite 2L', 'Espaguetis x3'], imageUrl: '' },
  { id: 'c4', name: 'Combo Aseo', description: 'Limpieza completa del hogar', priceCUP: 1200, priceMLC: 4.00, savingsCUP: 250, items: ['Detergente 1L', 'Jabón x4', 'Pasta dental x2', 'Papel higiénico x2'], imageUrl: '' },
];

export const initialZones: DeliveryZone[] = [
  { id: 'z1', name: 'Centro de Pinar del Río', feeCUP: 150, feeMLC: 0.50, estimatedTime: '25-40 min' },
  { id: 'z2', name: 'Hermanos Cruz', feeCUP: 150, feeMLC: 0.50, estimatedTime: '30-45 min' },
  { id: 'z3', name: 'Carlos Manuel', feeCUP: 200, feeMLC: 0.70, estimatedTime: '30-45 min' },
  { id: 'z4', name: 'Capitán San Luis', feeCUP: 200, feeMLC: 0.70, estimatedTime: '35-50 min' },
  { id: 'z5', name: 'San Juan y Martínez', feeCUP: 350, feeMLC: 1.20, estimatedTime: '50-70 min' },
  { id: 'z6', name: 'Consolación del Sur', feeCUP: 400, feeMLC: 1.35, estimatedTime: '55-75 min' },
  { id: 'z7', name: 'Viñales', feeCUP: 450, feeMLC: 1.50, estimatedTime: '60-80 min' },
  { id: 'z8', name: 'Los Palacios', feeCUP: 400, feeMLC: 1.35, estimatedTime: '55-75 min' },
  { id: 'z9', name: 'Minas de Matahambre', feeCUP: 500, feeMLC: 1.70, estimatedTime: '70-90 min' },
  { id: 'z10', name: 'La Coloma', feeCUP: 350, feeMLC: 1.20, estimatedTime: '50-70 min' },
];
