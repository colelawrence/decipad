import { introText } from './introText';

export const intro = introText;

export const instructions = `INSTRUCTIONS:
Always reply with only one line of code wrapped in \`\`\`deci
<code here>
\`\`\`
Don't give me final results. Instead, try to give me the code to get there by using existing variables in the code elements given above as much as possible.
Variables are declared like this: \`VarName = <value>\`.`;
