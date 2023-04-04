export const errorFromFetchResult = async (resp: Response): Promise<Error> => {
  const respText = await resp.text();
  try {
    const respJson = JSON.parse(respText);
    if ('message' in respJson) {
      return new Error(respJson.message);
    }
  } catch (err) {
    // do nothing
  }
  throw new Error(respText);
};
