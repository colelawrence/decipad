//
// This file will act as a specification for specific decisions to do with parsing.
//

import { RemoteComputer } from '@decipad/remote-computer';
import { inferType } from './inferType';

let computer = new RemoteComputer();
beforeEach(() => {
  computer = new RemoteComputer();
});

it('does not parse dates', async () => {
  //
  // We do not parse dates because they are computationally quite expensive.
  // They end up as the bottle neck in parsing.
  //
  // So we don't automatically try and infer dates, and let the user decide,
  // it's a sacrifice we make to make performance better.
  //

  await expect(inferType(computer, '1716985282')).resolves.toMatchObject({
    coerced: '1716985282',
    type: {
      kind: 'number',
      unit: null,
    },
  });
});
