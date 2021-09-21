import getRandomPort from 'get-port';

async function getPortExcept(
  range: ReturnType<typeof getRandomPort.makeRange>,
  exclude: number[] = []
) {
  let port: number;
  do {
    // eslint-disable-next-line no-await-in-loop
    port = await getRandomPort({ port: range });
  } while (exclude.indexOf(port) >= 0);
  return port;
}

function toString(ports: number[]): string[] {
  return ports.map((n) => n.toString());
}

export default async function getPorts(
  workerId: number,
  portCount: number
): Promise<string[]> {
  const rangeStart = 3333 + workerId * 1000;
  const rangeEnd = rangeStart + 999;
  const portRange = getRandomPort.makeRange(rangeStart, rangeEnd);
  const portBase = await getRandomPort({ port: portRange });
  const ports: number[] = [portBase];
  for (let i = 1; i < portCount; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    ports.push(await getPortExcept(portRange, ports));
  }
  return toString(ports);
}
