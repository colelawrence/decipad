export const getClearText = (divContent: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = divContent || '';

  // Remove the <title> tags from the <svg> elements
  const svgElements = tempDiv.getElementsByTagName('svg');
  for (const svg of svgElements) {
    const titleTags = svg.getElementsByTagName('title');
    for (const titleTag of titleTags) {
      titleTag.remove();
    }
  }

  // Extract the text content
  return Promise.resolve(
    tempDiv && typeof tempDiv.textContent === 'string'
      ? tempDiv.textContent.trim()
      : ''
  );
};
