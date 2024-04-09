import type { PlateElementProps } from '@udecode/plate-common';
import { PlateElement } from '@udecode/plate-common';
import type {
  TExcalidrawElement,
  TExcalidrawProps,
} from '@udecode/plate-excalidraw';
import { useExcalidrawElement } from '@udecode/plate-excalidraw';
import type { DrawElementDescendant } from '@decipad/editor-types';

export type ExcalidrawRef = NonNullable<TExcalidrawProps['excalidrawRef']>;

export type ExcalidrawProps = PlateElementProps<
  DrawElementDescendant[],
  TExcalidrawElement
> & {
  excalidrawProps?: TExcalidrawProps & {
    ref?: ExcalidrawRef;
  };
};

export function ExcalidrawElement({
  nodeProps,
  excalidrawProps: _excalidrawProps,
  ...props
}: ExcalidrawProps) {
  const { children, element } = props;

  const { Excalidraw, excalidrawProps } = useExcalidrawElement({
    element,
  });

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <div className="h-[600px]">
          {Excalidraw && (
            <Excalidraw
              {...nodeProps}
              {...(excalidrawProps as any)}
              {..._excalidrawProps}
            />
          )}
        </div>
      </div>
      {children}
    </PlateElement>
  );
}
