import { PlatePluginComponent } from '@udecode/plate';

export const TbodyElement: PlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  return (
    <tbody {...attributes} {...nodeProps}>
      {children}
    </tbody>
  );
};
