export const formatMoneyType = (obj) => {
  if (!obj) return null;
  return [obj.amount, obj.currency];
};
