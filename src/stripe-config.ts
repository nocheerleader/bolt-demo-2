export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SW7xWwaP5GvdtT',
    priceId: 'price_1Rb5hlE9sWWwOMdjXNh6uNzX',
    name: 'Product Three',
    description: 'Premium subscription plan with advanced features',
    mode: 'subscription',
    price: 199.00,
  },
  {
    id: 'prod_SW7xfcqlZiTH99',
    priceId: 'price_1Rb5hRE9sWWwOMdjGvCyFdjj',
    name: 'Product Two',
    description: 'Standard subscription plan with essential features',
    mode: 'subscription',
    price: 89.00,
  },
  {
    id: 'prod_SW7wppHnGqsM5G',
    priceId: 'price_1Rb5glE9sWWwOMdjsdPc7Tng',
    name: 'Test Product 1',
    description: 'Basic subscription plan for getting started',
    mode: 'subscription',
    price: 29.00,
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}