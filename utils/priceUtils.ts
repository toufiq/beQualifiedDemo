export const parsePrice = (priceText: string): number => {
  const value = priceText.replace(/[^0-9.]/g, '');
  return parseFloat(value) || 0;
};

export const formatPrice = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

export const sumPrices = (prices: string[]): number => {
  return prices.map(parsePrice).reduce((sum, price) => sum + price, 0);
};
