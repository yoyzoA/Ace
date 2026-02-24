export const getAvailableStock = (product) => {
  const stock = Number(product?.stock ?? 0);
  const reserved = Number(product?.reserved ?? 0);

  if (!Number.isFinite(stock) || !Number.isFinite(reserved)) {
    return 0;
  }

  return Math.max(stock - reserved, 0);
};
