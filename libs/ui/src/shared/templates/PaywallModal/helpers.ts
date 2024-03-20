export interface PaymentAnalyticsProps {
  planName: string;
  planKey: string;
}

export function getLatestWorkspace<
  T extends { id: string; createdAt?: string }
>(objects: Array<T>): string {
  let latest = '';
  let latestData = 0;

  for (const workspace of objects) {
    if (workspace.createdAt) {
      const unixTime = new Date(workspace.createdAt).getTime();

      if (unixTime > latestData) {
        latestData = unixTime;
        latest = workspace.id;
      }
    }
  }

  return latest;
}
