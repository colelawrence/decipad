export const codePlaceholders = [
  `// Convert currency
const from = 'ILS';
const to = 'GBP';
const result = await fetch(\`https://api.exchangerate-api.com/v4/latest/\${from}\`);
const data = await result.json();
const fxRate = data.rates[to];
return fxRate;`,
  `// list 20 pokemons
const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
const data = await res.json();
return data.results`,
  `// a fact about your birthyear
const year = "1985"
return (await fetch(\`http://numbersapi.com/\${year}/year\`)).text();`,
  `// list all dogs that dont have regional breeds
const res = await fetch('https://dog.ceo/api/breeds/list/all');
const data = await res.json();
const message = data.message;
const dogsNoSubsbreeds = Object.keys(message).map((breed) => {
  return {
    name: breed,
    firstBreed: message[breed][0],
    hasBreeds: message[breed].length > 0
  }
}).filter((breed) => !breed.hasBreeds)
return dogsNoSubsbreeds;`,
  `// ten trivia questions
const res = await fetch('https://opentdb.com/api.php?amount=10');
const data = await res.json();
const results = data.results;
return results;`,
  `// Exchange rate for crypto
const res = await fetch('https://api.coingecko.com/api/v3/exchange_rates');
const data = await res.json();
const rates = data.rates;
const allRates = Object.keys(rates).map((rateName) => {
  const current = rates[rateName];
  return {
    name: current.name,
    value: \`\${current.value}\`
  }
}).filter((rate) => rate.name !== 'Bitcoin')
return allRates;`,
  `// what country are you in
const result = await fetch('https://jsonip.com/');
const ipInfo = await result.json();
const country = ipInfo.country;
return country;`,
];

export function codePlaceholder() {
  const easterEgg = `//
//
// experimental feature:
//   const availableDecipadNumbers = this;
//   const { Banana } = this;
//
//   you can then do a request, or base your logic
//   on your decipad notebook`;
  const maybeEaster = Math.random() > 0.8 ? `\n${easterEgg}` : '';
  const source =
    codePlaceholders[Math.floor(Math.random() * codePlaceholders.length)];
  return `${source}${maybeEaster}`;
}
