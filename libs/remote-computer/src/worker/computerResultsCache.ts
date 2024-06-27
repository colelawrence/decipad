/* eslint-disable no-console */
import { Computer, NotebookResults } from '@decipad/computer-interfaces';
import { createCache } from '@decipad/client-cache';
import { ComputerResultsCache } from './types';
import { debounceTime, shareReplay } from 'rxjs';
import { captureException } from '@sentry/browser';
import { SerializedNotebookResults } from '../types/serializedTypes';
import { encodeFullNotebookResults } from '../encode/encodeFullNotebookResults';
import { decodeFullNotebookResults } from '../decode/decodeFullNotebookResults';

const CACHE_RESULTS_DEBOUNCE_TIME_MS = 3000;

export const createComputerResultsCache = (
  computer: Computer,
  notebookId: string
): ComputerResultsCache => {
  const cache = createCache<NotebookResults, SerializedNotebookResults>({
    rootValueKeys: ['blockResults', 'indexLabels'],
    encode: encodeFullNotebookResults,
    decode: decodeFullNotebookResults,
  });

  let emittedFirstResults = false;
  let latestCachedResults: NotebookResults | undefined;

  const onNewResults = (results: NotebookResults) => {
    emittedFirstResults = true;
    if (results === latestCachedResults) {
      return;
    }
    latestCachedResults = results;
    // eslint-disable-next-line no-use-before-define
    emittedCachedResults
      .then(() => {
        cache
          .set(notebookId, results)
          .finally(() => {
            console.log('Cached results', results);
          })
          .catch((err) => {
            console.error('Failed to cache results', err);
            captureException(err);
          });
      })
      .catch((err) => {
        console.error('Failed to emit cached results', err);
        captureException(err);
      });
  };

  const resultsSubscription = computer.results
    .asObservable()
    .pipe(shareReplay(2), debounceTime(CACHE_RESULTS_DEBOUNCE_TIME_MS))
    .subscribe(onNewResults);

  const emittedCachedResults = (async () => {
    try {
      const cachedResults = await cache.get(notebookId);
      if (cachedResults != null && !emittedFirstResults) {
        console.log('Results cache: emitting first results', cachedResults);
        latestCachedResults = cachedResults;
        computer.results.next(cachedResults);
      } else {
        console.log('No cached results found');
      }
    } catch (err) {
      console.error('Error decoding cached results', err);
      captureException(err);
    }
  })();

  const terminate = () => {
    resultsSubscription?.unsubscribe();
  };

  return {
    terminate,
  };
};
