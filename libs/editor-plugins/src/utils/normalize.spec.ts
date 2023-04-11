import { createTEditor, getNodeEntry, TEditor, TText } from '@udecode/plate';
import { mockConsoleError } from '@decipad/testutils';

import {
  normalizeExcessProperties,
  normalizeMissingProperties,
} from './normalize';
import { NormalizerReturnValue } from '../pluginFactories';

const applyNormalization = (norm: NormalizerReturnValue): boolean => {
  if (norm) {
    norm();
    return true;
  }
  return false;
};

describe('normalizeExcessProperties', () => {
  let editor!: TEditor;
  beforeEach(() => {
    editor = createTEditor();
    editor.children = [
      {
        type: 'p',
        id: 'asdf',
        extraProp: 'hi',
        children: [{ text: '', extraProp: 'hi' }],
      },
    ];
  });

  it('removes excess properties from a text node', () => {
    expect(editor).toHaveProperty('children.0.children.0.extraProp');
    applyNormalization(
      normalizeExcessProperties(
        editor,
        getNodeEntry(editor, { path: [0, 0], offset: 0 })
      )
    );
    expect(editor).not.toHaveProperty('children.0.children.0.extraProp');
  });

  it('removes excess properties from an element node', () => {
    expect(editor).toHaveProperty('children.0.extraProp');
    applyNormalization(
      normalizeExcessProperties(
        editor,
        getNodeEntry(editor, { path: [0], offset: 0 })
      )
    );
    expect(editor).not.toHaveProperty('children.0.extraProp');
  });

  it('returns false if no properties were removed', () => {
    editor.children = [{ type: 'p', children: [{ text: '' }] }];
    expect(
      applyNormalization(
        normalizeExcessProperties(
          editor,
          getNodeEntry(editor, { path: [0], offset: 0 })
        )
      )
    ).toBe(false);
  });
  it('returns true if properties were removed', () => {
    editor.children = [
      { type: 'p', extraProp: 'hi', children: [{ text: '' }] },
    ];
    expect(
      applyNormalization(
        normalizeExcessProperties(
          editor,
          getNodeEntry(editor, { path: [0], offset: 0 })
        )
      )
    ).toBe(true);
  });

  describe('given an absurd node', () => {
    mockConsoleError();
    it('does not allow a node to be neither element nor text', () => {
      editor.children = [{ type: 'p', children: [{} as TText] }];
      expect(() =>
        applyNormalization(
          normalizeExcessProperties(
            editor,
            getNodeEntry(editor, { path: [0, 0], offset: 0 })
          )
        )
      ).toThrow(/element.+text/i);
    });
    it('does not allow a node to be element and text simulatenously', () => {
      editor.children = [
        { type: 'p', children: [{ text: '', children: [{ text: '' }] }] },
      ];
      expect(() =>
        applyNormalization(
          normalizeExcessProperties(
            editor,
            getNodeEntry(editor, { path: [0, 0], offset: 0 })
          )
        )
      ).toThrow(/element.+text/i);
    });
  });

  describe('allowedPropKeys', () => {
    it('exempts additional properties from removal', () => {
      applyNormalization(
        normalizeExcessProperties(
          editor,
          getNodeEntry(editor, { path: [0], offset: 0 }),
          ['extraProp']
        )
      );
      expect(editor).toHaveProperty('children.0.extraProp');
    });
  });

  describe('missingPropGenerator', () => {
    mockConsoleError();

    it('adds missing mandatory property', () => {
      applyNormalization(
        normalizeMissingProperties(
          editor,
          getNodeEntry(editor, { path: [0], offset: 0 }),
          ['mandatoryProp'],
          { mandatoryProp: () => 'val' }
        )
      );
      expect(editor).toHaveProperty('children.0.mandatoryProp', 'val');
    });

    it('deletes the element if there is a missing mandatory property that we cannot generate', () => {
      applyNormalization(
        normalizeMissingProperties(
          editor,
          getNodeEntry(editor, { path: [0], offset: 0 }),
          ['missingProp'],
          {}
        )
      );
      expect(editor.children).toHaveLength(0);
    });
  });
});
