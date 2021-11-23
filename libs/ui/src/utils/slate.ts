import { RenderElementProps, RenderLeafProps } from 'slate-react';

export interface SlateElementProps {
  readonly slateAttrs?: RenderElementProps['attributes'];
}

export interface SlateLeafProps {
  readonly slateAttrs?:
    | RenderElementProps['attributes']
    | RenderLeafProps['attributes'];
}
