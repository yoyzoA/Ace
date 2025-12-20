export const formatPrice = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

export const formatSpecLine = (spec) => `${spec.label}: ${spec.value}`;
