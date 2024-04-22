import type { AnyElement, ElementVariants } from '@decipad/editor-types';
import type { PermissionType } from '@decipad/graphql-client';

type TrackedIntegrations = 'notion' | 'codeconnection' | 'mysql';

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
        type: 'public' | 'private-url';
      };
    }
  | {
      action: 'unpublish notebook';
      props: {
        id: string;
      };
    }
  | { action: 'clear all'; props?: undefined }
  | {
      action: 'Comment Submitted';
      props: {
        notebook_id: string;
        permissions_type: PermissionType | null | undefined;
        analytics_source: 'frontend' | 'backend';
      };
    }
  // Visitor
  | { action: 'try decipad'; props?: undefined }
  // Editor actions
  | { action: 'number field updated'; props: { isReadOnly: boolean } }
  | { action: 'notebook share link copied'; props?: undefined }
  | { action: 'notebook embed link copied'; props?: undefined }
  | { action: 'notebook templates clicked'; props?: undefined }
  | { action: 'notebook code error docs link clicked'; props?: undefined }
  | { action: 'slash command'; props: { command: string } }
  | { action: 'block duplicated'; props: { blockType: string } }
  | { action: 'block moved to other tab'; props: { blockType: string } }
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
  // sidebar
  | { action: 'sidebar block add'; props: { command: string } }
  // Generic code actions
  | {
      action: 'user code error';
      props: {
        errorType: string;
        message: string;
        url: string;
        elementType?: AnyElement['type'];
      };
    }
  // Onboarding
  | { action: 'onboarding screen'; props?: { screen: string } }
  // Inviting
  | { action: 'click invite button'; props?: undefined }
  // Customer Support
  | { action: 'contact live support'; props?: undefined }
  | { action: 'send feedback'; props?: undefined }
  | { action: 'visit docs'; props?: { source: string } }
  | { action: 'visit releases'; props?: undefined }
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
    }
  // Tabs actions
  | { action: 'create new tab'; props?: undefined }
  // AI chat assistant actions
  | { action: 'ai chat send message'; props: { isSuggested: boolean } }
  | {
      action: 'Integration: Notebook viewed';
      props: { type: TrackedIntegrations };
    }
  | {
      action: 'Integration: Workspace Integration connection added';
      props: { type: TrackedIntegrations };
    }
  | {
      action: 'Integration: Notebook Integration added';
      props: { type: TrackedIntegrations };
    }
  | { action: 'Integration: Query sent'; props: { type: TrackedIntegrations } }
  // Pricing
  | {
      action: 'Pricing Modal Viewed';
      props: { url: string; analytics_source: 'frontend' | 'backend' };
    };

export type ActionEvent = {
  type: 'action';
} & Action;
