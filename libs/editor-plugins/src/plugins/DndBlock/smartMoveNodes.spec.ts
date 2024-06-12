import { createPlateEditor } from '@udecode/plate-common';
import { smartMoveNode, smartMoveNodes } from './smartMoveNodes';

const inline = (id: string) => ({
  type: 'inline',
  id,
  children: [{ text: '' }],
});

const block = (id: string, children: any) => ({
  type: 'block',
  id,
  children,
});

const initialB1 = () =>
  block('b1', [
    inline('i0.0'),
    inline('i0.1'),
    inline('i0.2'),
    inline('i0.3'),
    inline('i0.4'),
  ]);

const initialB2 = () => block('b2', [inline('i1.0')]);

const initialValue = () => [initialB1(), initialB2()];

const shuffle = <T>(xs: T[]): T[] =>
  xs.sort(() => (Math.random() > 0.5 ? 1 : -1));

const editor = createPlateEditor();

describe('smartMoveNode', () => {
  beforeEach(() => {
    editor.children = initialValue();
  });

  describe('when paths are equal', () => {
    const fromPath = [0, 2];
    const toPath = [0, 2];

    (['before', 'after'] as const).forEach((direction) => {
      it(`does nothing when moving ${direction}`, () => {
        const moved = smartMoveNode(editor, fromPath, toPath, direction);
        expect(moved).toBe(false);
        expect(editor.children).toMatchObject(initialValue());
      });
    });
  });

  describe('when destination path is first sibling', () => {
    const fromPath = [0, 2];
    const toPath = [0, 0];

    it('moves before', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'before');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.2'),
          inline('i0.0'), // To before here
          inline('i0.1'),
          // From here
          inline('i0.3'),
          inline('i0.4'),
        ]),
        initialB2(),
      ]);
    });

    it('moves after', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'after');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.0'), // To after here
          inline('i0.2'),
          inline('i0.1'),
          // From here
          inline('i0.3'),
          inline('i0.4'),
        ]),
        initialB2(),
      ]);
    });
  });

  describe('when destination path is previous sibling', () => {
    const fromPath = [0, 2];
    const toPath = [0, 1];

    it('moves before', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'before');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.0'),
          inline('i0.2'),
          inline('i0.1'), // To before here
          // From here
          inline('i0.3'),
          inline('i0.4'),
        ]),
        initialB2(),
      ]);
    });

    it('does nothing when moving after', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'after');
      expect(moved).toBe(false);
      expect(editor.children).toMatchObject(initialValue());
    });
  });

  describe('when destination path is next sibling', () => {
    const fromPath = [0, 2];
    const toPath = [0, 3];

    it('does nothing when moving before', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'before');
      expect(moved).toBe(false);
      expect(editor.children).toMatchObject(initialValue());
    });

    it('moves after', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'after');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.0'),
          inline('i0.1'),
          // From here
          inline('i0.3'), // To after here
          inline('i0.2'),
          inline('i0.4'),
        ]),
        initialB2(),
      ]);
    });
  });

  describe('when destination path is last sibling', () => {
    const fromPath = [0, 2];
    const toPath = [0, 4];

    it('moves before', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'before');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.0'),
          inline('i0.1'),
          // From here
          inline('i0.3'),
          inline('i0.2'),
          inline('i0.4'), // To before here
        ]),
        initialB2(),
      ]);
    });

    it('moves after', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'after');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.0'),
          inline('i0.1'),
          // From here
          inline('i0.3'),
          inline('i0.4'), // To after here
          inline('i0.2'),
        ]),
        initialB2(),
      ]);
    });
  });

  describe('when paths are unrelated', () => {
    const fromPath = [0, 2];
    const toPath = [1, 0];

    it('moves before', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'before');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.0'),
          inline('i0.1'),
          // From here
          inline('i0.3'),
          inline('i0.4'),
        ]),
        block('b2', [
          inline('i0.2'),
          inline('i1.0'), // To before here
        ]),
      ]);
    });

    it('moves after', () => {
      const moved = smartMoveNode(editor, fromPath, toPath, 'after');
      expect(moved).toBe(true);
      expect(editor.children).toMatchObject([
        block('b1', [
          inline('i0.0'),
          inline('i0.1'),
          // From here
          inline('i0.3'),
          inline('i0.4'),
        ]),
        block('b2', [
          inline('i1.0'), // To after here
          inline('i0.2'),
        ]),
      ]);
    });
  });
});

describe('smartMoveNodes', () => {
  beforeEach(() => {
    editor.children = initialValue();
  });

  it('moves forward to before last', () => {
    smartMoveNodes(
      editor,
      shuffle([
        [0, 0],
        [0, 1],
        [0, 2],
      ]),
      [0, 4],
      'before'
    );
    expect(editor.children).toMatchObject([
      block('b1', [
        // From here
        inline('i0.3'),
        inline('i0.0'),
        inline('i0.1'),
        inline('i0.2'),
        inline('i0.4'), // To before here
      ]),
      initialB2(),
    ]);
  });

  it('moves forward to after last', () => {
    smartMoveNodes(
      editor,
      shuffle([
        [0, 0],
        [0, 1],
        [0, 2],
      ]),
      [0, 4],
      'after'
    );
    expect(editor.children).toMatchObject([
      block('b1', [
        // From here
        inline('i0.3'),
        inline('i0.4'), // To after here
        inline('i0.0'),
        inline('i0.1'),
        inline('i0.2'),
      ]),
      initialB2(),
    ]);
  });

  it('moves backward to before first', () => {
    smartMoveNodes(
      editor,
      shuffle([
        [0, 2],
        [0, 3],
        [0, 4],
      ]),
      [0, 0],
      'before'
    );
    expect(editor.children).toMatchObject([
      block('b1', [
        inline('i0.2'),
        inline('i0.3'),
        inline('i0.4'),
        inline('i0.0'), // To before here
        inline('i0.1'),
        // From here
      ]),
      initialB2(),
    ]);
  });

  it('moves backward to after first', () => {
    smartMoveNodes(
      editor,
      shuffle([
        [0, 2],
        [0, 3],
        [0, 4],
      ]),
      [0, 0],
      'after'
    );
    expect(editor.children).toMatchObject([
      block('b1', [
        inline('i0.0'), // To after here
        inline('i0.2'),
        inline('i0.3'),
        inline('i0.4'),
        inline('i0.1'),
        // From here
      ]),
      initialB2(),
    ]);
  });

  it('does nothing when moving to start of selected range', () => {
    smartMoveNodes(
      editor,
      shuffle([
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      [0, 0],
      'after'
    );
    expect(editor.children).toMatchObject(initialValue());
  });

  it('does nothing when moving to end of selected range', () => {
    smartMoveNodes(
      editor,
      shuffle([
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      [0, 3],
      'after'
    );
    expect(editor.children).toMatchObject(initialValue());
  });

  it('does nothing when moving to a path inside the selected range', () => {
    smartMoveNodes(
      editor,
      shuffle([
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      [0, 2],
      'after'
    );
    expect(editor.children).toMatchObject(initialValue());
  });
});
