// Silence tensorflow's "hey you're using the CPU which is slow" warning
const oldWarn = console.warn;
console.warn = () => {};

import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
// alt backend: import '@tensorflow/tfjs-node'
// Enable Map/Set support in Immer
import { enableMapSet } from 'immer';
enableMapSet();

tf.tensor(0);
console.warn = oldWarn;
