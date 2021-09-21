import { PlatePluginComponent } from '@udecode/plate';

export const TheadElement: PlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  return (
    <thead {...attributes} {...nodeProps}>
      {children}
    </thead>
  );
};
