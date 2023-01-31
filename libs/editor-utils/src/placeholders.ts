const CLPlaceholders = [
  '60 km/h * Time',
  'Revenue - Cost',
  '10 minutes per kilometer in miles per hour',
  'Salary * 3 months',
  'sum(Budget.Costs)',
];

export const placeholderForCalculationLine = () => {
  return CLPlaceholders[Math.floor(Math.random() * CLPlaceholders.length)];
};
