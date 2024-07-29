/* eslint-disable no-console */
import { Computer, NotebookResults } from '@decipad/computer-interfaces';
import { createCache } from '@decipad/client-cache';
import { ComputerResultsCache } from './types';
import { debounceTime, shareReplay } from 'rxjs';
import { captureException } from '@sentry/browser';
import { putRemoteResult } from '@decipad/remote-computer-cache/worker';
import { SerializedNotebookResults } from '../types/serializedTypes';
import { encodeFullNotebookResults } from '../encode/encodeFullNotebookResults';
import { decodeFullNotebookResults } from '../decode/decodeFullNotebookResults';
import { encodeRemoteNotebookResults } from './encodeRemoteNotebookResults';
import { PROTOCOL_VERSION } from '../constants';
import { debug } from '../debug';

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

  const saveCacheResultsLocally = async (results: NotebookResults) => {
    cache
      .set(notebookId, results)
      .finally(() => {
        debug('Cached results locally', results);
      })
      .catch((err) => {
        console.error('Failed to save results to local cache', err);
        captureException(err);
      });
  };

  const saveCacheResultsRemotely = async (results: NotebookResults) => {
    return putRemoteResult(
      notebookId,
      results,
      encodeRemoteNotebookResults,
      PROTOCOL_VERSION
    )
      .then(() => {
        debug('Cached results remotely', results);
      })
      .catch((err) => {
        console.error('Failed to save results to remote cache', err);
        captureException(err);
      });
  };

  const onNewResults = (results: NotebookResults) => {
    emittedFirstResults = true;
    if (results === latestCachedResults) {
      return;
    }
    latestCachedResults = results;
    // eslint-disable-next-line no-use-before-define
    emittedCachedResults
      .then(() =>
        Promise.all([
          saveCacheResultsLocally(results),
          saveCacheResultsRemotely(results),
        ])
      )
      .catch((err) => {
        console.error('Failed to emit cached results', err);
        captureException(err);
      });
  };

  const resultsSubscription = computer.results
    .asObservable()
    .pipe(shareReplay(2), debounceTime(CACHE_RESULTS_DEBOUNCE_TIME_MS))
    .subscribe(onNewResults);

  const fetchAndEmitLocalCacheResults = async () => {
    try {
      const cachedResults = await cache.get(notebookId);
      if (cachedResults != null && !emittedFirstResults) {
        debug('Results cache: emitting first results', cachedResults);
        latestCachedResults = cachedResults;
        computer.results.next(cachedResults);
      } else {
        debug('No locally cached results found');
      }
    } catch (err) {
      console.error('Error decoding cached results', err);
      captureException(err);
    }
  };

  const emittedCachedResults = fetchAndEmitLocalCacheResults();

  const terminate = () => {
    resultsSubscription?.unsubscribe();
  };

  return {
    terminate,
  };
};
