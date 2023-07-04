const defaultEnv = (ports) => ({
  ARC_WSS_URL: `ws://localhost:${ports.http}/ws`,
});

module.exports.getEnv = function getEnv(ports) {
  const { env } = process;
  for (const [key, value] of Object.entries(defaultEnv(ports))) {
    if (!env[key]) {
      env[key] = value;
    }
  }
  return env;
};
