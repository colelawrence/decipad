export const commandSchema = `
interface AddCommand {
  action: 'add';
  newBlock: BlockElement; // the block to add
  placeAfterBlockId?: string; // id of the block to insert after
}

interface RemoveCommand {
  action: 'remove';
  blockId: string; // the ids of the block to remove
}

interface ChangeCommand {
  action: 'change';
  oldBlock: BlockElement; // the old version of the block
  newBlock: BlockElement; // the new version of the block
}

type Command = AddCommand | RemoveCommand | ChangeCommand;

type Commands = Array<Command>;
`;
