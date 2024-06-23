type JsDocParams = {
  [key: string]: {
    type: string;
    description: string;
  };
};

export type JsIntegrationMessageData = {
  fnName: string;
  jsDocParams: JsDocParams;
  envVars: string[];
  params: string[];
  functionBody: string;
};
export type IntegrationMessageData = JsIntegrationMessageData & {
  content: string;
};
