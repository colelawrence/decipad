type FetchQueryRes =
  | {
      type: 'success';
      data: object;
    }
  | {
      type: 'error';
      error: string;
      message: string;
      statusCode: number;
    };

export async function fetchQuery(
  url: string,
  query: string
): Promise<FetchQueryRes | undefined> {
  try {
    const queryRes = await fetch(url, {
      body: query,
      method: 'POST',
    });
    const res = await queryRes.json();
    if ('error' in res) {
      return { type: 'error', ...res };
    }
    return { type: 'success', data: res };
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
