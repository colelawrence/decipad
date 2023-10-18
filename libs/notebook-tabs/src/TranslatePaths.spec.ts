import { TranslateOpUp, TranslateOpDown } from './TranslatePaths';

describe('Translating paths by adding tab index', () => {
  it('Translates insert_text', () => {
    const translatedOp = TranslateOpUp(0, {
      type: 'insert_text',
      path: [1, 0],
      offset: 5,
      text: 'Hello',
    });

    expect(translatedOp).toMatchObject({
      type: 'insert_text',
      path: [0, 1, 0],
      offset: 5,
      text: 'Hello',
    });
  });

  it('Translates move_node operation', () => {
    const translatedOp = TranslateOpUp(5, {
      type: 'move_node',
      path: [1, 0],
      newPath: [2, 0],
    });

    expect(translatedOp).toMatchObject({
      type: 'move_node',
      path: [5, 1, 0],
      newPath: [5, 2, 0],
    });
  });

  it('Translates set_selection operation', () => {
    const translatedOp = TranslateOpUp(2, {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 2, 3],
          offset: 2,
        },
        anchor: {
          path: [1, 2, 3],
          offset: 2,
        },
      },
      newProperties: {
        focus: {
          path: [3, 2, 3],
          offset: 4,
        },
        anchor: {
          path: [1, 2, 3],
          offset: 2,
        },
      },
    });

    expect(translatedOp).toMatchObject({
      type: 'set_selection',
      properties: {
        focus: {
          path: [2, 1, 2, 3],
          offset: 2,
        },
        anchor: {
          path: [2, 1, 2, 3],
          offset: 2,
        },
      },
      newProperties: {
        focus: {
          path: [2, 3, 2, 3],
          offset: 4,
        },
        anchor: {
          path: [2, 1, 2, 3],
          offset: 2,
        },
      },
    });
  });
});

describe('Translating paths into sub editor operations', () => {
  it('Translates insert_text', () => {
    const translatedOp = TranslateOpDown({
      type: 'insert_text',
      path: [0, 1, 0],
      offset: 5,
      text: 'Hello',
    });

    expect(translatedOp).toMatchObject([
      0,
      {
        type: 'insert_text',
        path: [1, 0],
        offset: 5,
        text: 'Hello',
      },
    ]);
  });

  it('Translates move_node operation', () => {
    const translatedOp = TranslateOpDown({
      type: 'move_node',
      path: [1, 1, 0],
      newPath: [1, 2, 0],
    });

    expect(translatedOp).toMatchObject([
      1,
      {
        type: 'move_node',
        path: [1, 0],
        newPath: [2, 0],
      },
    ]);
  });

  it('Translates set_selection operation', () => {
    const translatedOp = TranslateOpDown({
      type: 'set_selection',
      properties: {
        focus: {
          path: [6, 1, 2, 3],
          offset: 2,
        },
        anchor: {
          path: [6, 1, 2, 3],
          offset: 2,
        },
      },
      newProperties: {
        focus: {
          path: [6, 3, 2, 3],
          offset: 4,
        },
        anchor: {
          path: [6, 1, 2, 3],
          offset: 2,
        },
      },
    });

    expect(translatedOp).toMatchObject([
      6,
      {
        type: 'set_selection',
        properties: {
          focus: {
            path: [1, 2, 3],
            offset: 2,
          },
          anchor: {
            path: [1, 2, 3],
            offset: 2,
          },
        },
        newProperties: {
          focus: {
            path: [3, 2, 3],
            offset: 4,
          },
          anchor: {
            path: [1, 2, 3],
            offset: 2,
          },
        },
      },
    ]);
  });
});
