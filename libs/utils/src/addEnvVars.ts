export const addEnvVars = (js: string, envVars: Map<string, string>) => {
  const processString = `const process = {
  env: {
${Array.from(envVars)
  .map(([key, value]) => `    ${key}: "{{{secrets.${value}}}}"`)
  .join(',\n')}
  }
};`;
  return `${processString}\n\n${js}`;
};
