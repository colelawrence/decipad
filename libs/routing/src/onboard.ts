import { route, intParser } from 'typesafe-routes';

const step = route('/:step', { step: intParser }, {});

export default route('/onboard', {}, { step });
