export const unwrapCodeContent = (content: string) => {
  let started = false;
  const result: string[] = [];
  const lines = content.split('\n');
  const linesWithCodeMark = lines.filter((line) => line.startsWith('```'));
  if (linesWithCodeMark.length === 0) {
    return content;
  }
  const linesWithCodeMarkCount = linesWithCodeMark.length;
  const lastBeginningCodeMarkLineIndex =
    linesWithCodeMarkCount % 2 === 0
      ? linesWithCodeMarkCount - 1
      : linesWithCodeMarkCount;

  let pendingMarks = lastBeginningCodeMarkLineIndex;
  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!started) {
        pendingMarks -= 1;
        if (pendingMarks === 0) {
          started = true;
        }
      } else {
        return result.join('\n').trim();
      }
    } else if (started) {
      result.push(line);
    }
  }
  if (started) {
    return result.join('\n').trim();
  }
  return content;
};
