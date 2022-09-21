interface UpdatePromptProps {
  onReload: () => void;
}

export const UpdatePrompt = ({ onReload }: UpdatePromptProps) => {
  return (
    <div>
      <p>There is a new version of Deci available.</p>
      <p>
        <a href="/" onClick={onReload}>
          Click here to update
        </a>
      </p>
    </div>
  );
};
