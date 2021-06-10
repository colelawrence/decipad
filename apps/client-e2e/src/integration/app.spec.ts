describe('client', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    cy.get('h2').contains('MAKE BETTER DECISIONS');
  });
});
