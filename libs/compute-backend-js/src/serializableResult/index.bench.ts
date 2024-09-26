import { bench, describe } from 'vitest';
import { deserializeResult, serializeResult } from '.';
import { N } from '@decipad/number';
import { Result } from 'libs/language-interfaces/src/Result';
import { computeBackendSingleton } from '../index';

describe('serializeResult', async () => {
  bench('boolean', () => {
    serializeResult({
      type: { kind: 'boolean' },
      value: true,
    });
  });

  const num: Result<'number'> = {
    type: { kind: 'number' },
    value: N({ n: 1n, d: 2n, s: 1n, infinite: false }),
  };

  bench('number', () => {
    serializeResult(num);
  });

  const string: Result<'string'> = {
    type: { kind: 'string' },
    value: 'hello',
  };

  bench('string', () => {
    serializeResult(string);
  });

  const boolCol10_000: Result<'materialized-column'> = {
    type: {
      kind: 'materialized-column',
      indexedBy: 'number',
      cellType: { kind: 'boolean' },
    },
    value: new Array(10_000).fill(true),
    meta: undefined,
  };

  bench('column of 10,000 bools', () => {
    serializeResult(boolCol10_000);
  });

  const numCol10_000: Result<'materialized-column'> = {
    type: {
      kind: 'materialized-column',
      indexedBy: 'number',
      cellType: { kind: 'string' },
    },
    value: new Array(10_000).fill(N({ n: 1n, d: 2n, s: 1n, infinite: false })),
    meta: undefined,
  };

  bench('column of 10,000 numbers', () => {
    serializeResult(numCol10_000);
  });

  const stringCol10_000: Result<'materialized-column'> = {
    type: {
      kind: 'materialized-column',
      indexedBy: 'number',
      cellType: { kind: 'string' },
    },
    value: new Array(10_000).fill('hello'),
    meta: undefined,
  };

  bench('column of 10,000 strings', () => {
    serializeResult(stringCol10_000);
  });
});

describe('deserializeResult', async () => {
  const bool = {
    type: BigUint64Array.from([0n, 0n, 1n]),
    data: new Uint8Array([1]),
  };

  bench('boolean', () => {
    deserializeResult(bool);
  });

  const num = {
    type: new BigUint64Array([11n, 0n, 10n]),
    data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 1]),
  };

  bench('number', () => {
    deserializeResult(num);
  });

  const string = {
    type: new BigUint64Array([3n, 0n, 13n]),
    data: new TextEncoder().encode('Hello, world!'),
  };

  bench('string', () => {
    deserializeResult(string);
  });

  const boolCol10_000 = {
    type: new BigUint64Array(30_003),
    data: new Uint8Array(10_000),
  };

  boolCol10_000.type[0] = 4n;
  boolCol10_000.type[1] = 1n;
  boolCol10_000.type[2] = 10_000n;

  for (let i = 1; i <= 10_000; i++) {
    boolCol10_000.type[i * 3] = 0n;
    boolCol10_000.type[i * 3 + 1] = BigInt(i);
    boolCol10_000.type[i * 3 + 2] = 1n;
    boolCol10_000.data[i] = 1;
  }

  bench('column of 10,000 bools', () => {
    deserializeResult(boolCol10_000);
  });

  const stringCol10_000 = {
    type: new BigUint64Array(30_003),
    data: new Uint8Array(50_000),
  };
  stringCol10_000.type[0] = 4n;
  stringCol10_000.type[1] = 1n;
  stringCol10_000.type[2] = 10_000n;

  for (let i = 1; i <= 10_000; i++) {
    stringCol10_000.type[i * 3] = 3n;
    stringCol10_000.type[i * 3 + 1] = BigInt((i - 1) * 5);
    stringCol10_000.type[i * 3 + 2] = 5n;
  }
  const helloString = new TextEncoder().encode('hello');
  for (let i = 0; i < 50_000; i++) {
    stringCol10_000.data[i] = helloString[i % 5];
  }

  bench('column of 10,000 strings', () => {
    deserializeResult(stringCol10_000);
  });

  const numCol10_000 = {
    type: new BigUint64Array(30_003),
    data: new Uint8Array(10_000),
  };

  numCol10_000.type[0] = 4n;
  numCol10_000.type[1] = 1n;
  numCol10_000.type[2] = 10_000n;
  for (let i = 1; i <= 10_000; i++) {
    numCol10_000.type[i * 3] = 11n;
    numCol10_000.type[i * 3 + 1] = BigInt((i - 1) * 10);
    numCol10_000.type[i * 3 + 2] = 10n;
  }

  const third = [1, 0, 0, 0, 1, 1, 0, 0, 0, 3];
  for (let i = 0; i < 100_000; i++) {
    numCol10_000.data[i] = third[i % 10];
  }

  bench('column of 10,000 numbers', () => {
    deserializeResult(numCol10_000);
  });
});

describe('Rust serializeResult', () => {
  bench('benchmark nothing', () => {
    computeBackendSingleton.computeBackend.bench_serialize_nothing();
  });

  bench('serialize boolean', () => {
    computeBackendSingleton.computeBackend.bench_serialize_boolean();
  });

  bench('serialize number', () => {
    computeBackendSingleton.computeBackend.bench_serialize_number();
  });

  bench('serialize string', () => {
    computeBackendSingleton.computeBackend.bench_serialize_string();
  });

  bench('serialize boolean column', () => {
    computeBackendSingleton.computeBackend.bench_serialize_bool_col();
  });

  bench('serialize number column', () => {
    computeBackendSingleton.computeBackend.bench_serialize_num_col();
  });

  bench('serialize string column', () => {
    computeBackendSingleton.computeBackend.bench_serialize_string_col();
  });
});

describe('Rust deserializeResult', () => {
  bench('deserializeResult nothing', () => {
    computeBackendSingleton.computeBackend.bench_deserialize_nothing();
  });

  bench('deserializeResult bool', () => {
    computeBackendSingleton.computeBackend.bench_deserialize_bool();
  });

  bench('deserializeResult number', () => {
    computeBackendSingleton.computeBackend.bench_deserialize_number();
  });

  bench('deserializeResult string', () => {
    computeBackendSingleton.computeBackend.bench_deserialize_string();
  });

  bench('deserializeResult bool col', () => {
    computeBackendSingleton.computeBackend.bench_deserialize_bool_col();
  });

  bench('deserializeResult number col', () => {
    computeBackendSingleton.computeBackend.bench_deserialize_num_col();
  });

  bench('deserializeResult string col', () => {
    computeBackendSingleton.computeBackend.bench_deserialize_string_col();
  });
});
