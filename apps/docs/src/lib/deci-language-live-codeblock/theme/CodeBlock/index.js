import React from 'react';
import Playground from '@theme/Playground';
import ReactLiveScope from '@theme/ReactLiveScope';
import CodeBlock from '@theme-init/CodeBlock';

const withLiveEditor = (Component) => {
  const WrappedComponent = (props) => {
    if (props.live) {
      return <Playground scope={ReactLiveScope} {...props} />;
    }

    return <Component {...props} />;
  };

  return WrappedComponent;
};

export default withLiveEditor(CodeBlock);
