import type { AnyElement, ElementVariants } from '@decipad/editor-types';
import type { PermissionType } from '@decipad/graphql-client';

type TrackedIntegrations = 'notion' | 'codeconnection' | 'mysql';

type Action =
  // NEW TRACKERS
  | {
      action: 'Pricing Modal Viewed';
      props: {
        url: string;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Comment Submitted';
      props: {
        notebook_id: string;
        permissions_type: PermissionType | null | undefined;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Tab Created';
      props: {
        notebook_id?: string;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Tab Hidden';
      props: {
        notebook_id?: string;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Show Table Formulas Button Clicked';
      props: {
        notebook_id?: string;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Hide Table Formulas Button Clicked';
      props: {
        notebook_id?: string;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Tab Deleted';
      props: {
        notebook_id?: string;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Notebook Share Link Copied';
      props: {
        notebook_id?: string;
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Invite Team Button Clicked';
      props: {
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Feedback Button Clicked';
      props: {
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Templates Button Clicked';
      props: {
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Documentation Button Clicked';
      props: {
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Notebook Embed Link Copied';
      props: {
        analytics_source: 'frontend' | 'backend';
      };
    }
  | {
      action: 'Integration Set Up';
      props: {
        integration_type: TrackedIntegrations;
        analytics_source: 'backend' | 'frontend';
      };
    }
  | {
      action: 'AI Chat Message Submitted';
      props: {
        ai_message: string;
        analytics_source: 'frontend';
      };
    }
  | {
      action: 'AI Chat Suggestion Clicked';
      props: {
        picked_suggestion: string;
        analytics_source: 'frontend';
      };
    }

  // OLD TRACKER MIGHT GET DEPRECATED IN THE FUTURE
  // Notebook operations
  | { action: 'notebook duplicated'; props?: undefined }
  | { action: 'notebook shared'; props?: undefined }
  | { action: 'notebook deleted'; props?: undefined }
  | { action: 'notebook created'; props?: undefined }
  | { action: 'notebook icon changed'; props?: undefined }
  | { action: 'notebook icon color changed'; props?: undefined }
  | { action: 'notebook local changes removed'; props?: undefined }
  // Visitor
  | { action: 'try decipad'; props?: undefined }
  // Editor actions
  | { action: 'number field updated'; props: { isReadOnly: boolean } }
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
  // AI chat assistant actions
  | {
      action: 'Integration: Notebook viewed';
      props: { type: TrackedIntegrations };
    }
  | {
      action: 'Integration: Notebook Integration added';
      props: { type: TrackedIntegrations };
    }
  | { action: 'Integration: Query sent'; props: { type: TrackedIntegrations } };

export type ActionEvent = {
  type: 'action';
} & Action;
