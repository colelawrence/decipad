export interface JsonPath {
  label: string;
  fullPathFromRoot: string;
  children: JsonPath[];
}

const jsonPathsFromUnknown = (u: unknown, parentPath = ''): JsonPath[] => {
  if (u == null || typeof u !== 'object') {
    return [];
  }
  if (Array.isArray(u)) {
    return [
      ...u.map((value, index) => {
        const relativeSelector = `[${index}]`;
        const fullPathFromRoot = `${parentPath}${relativeSelector}`;
        return {
          label: relativeSelector,
          fullPathFromRoot,
          children: jsonPathsFromUnknown(value, fullPathFromRoot),
        };
      }),
    ];
  }
  return jsonPathsFromObject(u as Record<string, unknown>, parentPath);
};

export const jsonPathsFromObject = (
  object: Record<string, unknown>,
  parentPath = ''
): JsonPath[] => {
  const isRoot = parentPath === '';
  const paths = Object.keys(object).map((key) => {
    const label = key;
    const relativeSelector = `${isRoot ? '' : '.'}${label}`;
    const fullPathFromRoot = `${parentPath}${relativeSelector}`;
    return {
      label,
      fullPathFromRoot,
      children: jsonPathsFromUnknown(object[key], fullPathFromRoot),
    };
  });
  return paths;
};
