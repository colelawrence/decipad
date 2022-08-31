/* eslint-disable import/no-unresolved */
import React, { FC, ReactNode } from 'react';
import CodeBlock from '@theme-init/CodeBlock';
import Playground from '../Playground';
import ReactLiveScope from '../ReactLiveScope';

const snapshotSeparator = '\n==> ';

interface LiveAndChildrenProps {
  live: boolean;
  children: ReactNode;
}

function withLiveEditor<P extends LiveAndChildrenProps>(Component: FC<P>) {
  const WrappedComponent: FC<P> = (props) => {
    if (props.live) {
      const { children } = props;
      return (
        <Playground scope={ReactLiveScope} {...props}>
          {typeof children === 'string'
            ? children.split(snapshotSeparator)[0]
            : children?.toString() || ''}
        </Playground>
      );
    }

    return <Component {...props} />;
  };

  return WrappedComponent;
}

export default withLiveEditor(CodeBlock);
