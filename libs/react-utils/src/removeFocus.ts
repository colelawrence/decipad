export const removeFocusFromAllBecauseSlate = () => {
  const focusedElements = document.querySelectorAll(':focus');

  focusedElements.forEach((elem) => (elem as HTMLElement).blur());
};
