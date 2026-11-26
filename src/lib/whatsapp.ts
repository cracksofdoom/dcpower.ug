import { SITE } from '../config';
import type { Product } from '../data/products';
export const waLink = (text: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
export const orderLink = (lines: { product: Product; qty: number }[]) => {
  const body = lines
    .map(({ product: p, qty }) => `- ${qty} x ${p.name}`)
    .join('\n');
  return waLink(
    `Hello DC Power, I would like pricing and availability for:\n${body}\nPlease confirm the current price and delivery options.`,
  );
};
