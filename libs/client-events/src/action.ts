import { ElementVariants } from '@decipad/editor-types';

type Action =
  // Notebook operations
  | { action: 'notebook duplicated'; props?: undefined }
  | { action: 'notebook shared'; props?: undefined }
  | { action: 'notebook deleted'; props?: undefined }
  | { action: 'notebook created'; props?: undefined }
  | { action: 'notebook duplicated'; props?: undefined }
  | { action: 'notebook icon changed'; props?: undefined }
  | { action: 'notebook icon color changed'; props?: undefined }
  | { action: 'notebook local changes removed'; props?: undefined }
  | {
      action: 'publish notebook';
      props: {
        id: string;
      };
    }
  | {
      action: 'unpublish notebook';
      props: {
        id: string;
      };
    }
  // Visitor
  | { action: 'try decipad'; props?: undefined }
  // Editor actions
  | { action: 'number field updated'; props: { isReadOnly: boolean } }
  | { action: 'notebook share link copied'; props?: undefined }
  | { action: 'notebook get inspiration link clicked'; props?: undefined }
  | { action: 'notebook code error docs link clicked'; props?: undefined }
  | { action: 'slash command'; props: { command: string } }
  | { action: 'block duplicated'; props: { blockType: string } }
  | { action: 'copy block href'; props: { blockType: string } }
  | { action: 'click +'; props: { blockType: string } }
  | { action: 'block deleted'; props: { blockType: string } }
  | { action: 'show block'; props: { blockType: string } }
  | { action: 'hide block'; props: { blockType: string } }
  // Codeline actions
  | { action: 'number converted to code line'; props?: undefined }
  | { action: 'number created with ='; props?: undefined }
  | { action: 'code line teleported'; props?: undefined }
  | { action: 'code line teleported back'; props?: undefined }
  // Customer Support
  | { action: 'contact live support'; props?: undefined }
  | { action: 'send feedback'; props?: undefined }
  | { action: 'visit docs'; props?: undefined }
  | { action: 'help button clicked'; props?: undefined }
  | { action: 'join discord'; props?: undefined }
  | { action: 'user code error'; props: { message: string; url: string } }
  // Widget actions
  | {
      action: 'widget value updated';
      props: { variant: ElementVariants; isReadOnly: boolean };
    }
  | {
      action: 'widget type changed';
      props: {
        variant: ElementVariants;
        subVar?: string;
        isReadOnly: boolean;
        newType: string;
      };
    }
  | {
      action: 'widget renamed';
      props: { variant: ElementVariants };
    };

export type ActionEvent = {
  type: 'action';
} & Action;
