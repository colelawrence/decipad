export const areUnitQualitiesCompatible = (
  quality1?: string,
  quality2?: string
): boolean => {
  return (quality1 == null && quality2 == null) || quality1 === quality2;
};
