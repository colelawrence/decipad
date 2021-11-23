beforeEach(() => {
  // Cleans up some dirt chakra leaves behind that apparently react-testing-library is not removing.
  document.getElementById('chakra-toast-portal')?.remove();
});

export {};
