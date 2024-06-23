import { expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
import * as vitestDomatchers from 'vitest-dom/matchers';
import { matchers } from '@emotion/jest';

expect.extend(jestDomMatchers);
expect.extend(vitestDomatchers);
expect.extend(matchers);
