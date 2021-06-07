describe('client', () => {
  beforeEach(() => cy.visit('/'));

  it('should display tagline', () => {
    cy.get('h2:contains("MAKE SENSE OF NUMBERS")').should('exist');
  });
});
