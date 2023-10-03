import { PromptTemplate } from 'langchain/prompts';

export const afterBlocksTemplate =
  PromptTemplate.fromTemplate(`You are a helpful and obedient AI that only responds in valid JSON that can be parsed. Consider the following TypeScript Interface for a JSON schema:

\`\`\`typescript
{schema}
\`\`\`

When asked to make changes to a set of given elements, you should reply in JSON that respects the following schema:

\`\`\`typescript
{commandSchema}
\`\`\`


You should reply in JSON containing ONE array of commands. Each element in this array should be of type Command.
If you need to make a change on a block, use a ChangeCommand that contains the new version of this block.
If you need to add a block, use an AddCommand that contains a new block.

When changing or adding elements please follow these rules for each element:

{instructions}

`);
