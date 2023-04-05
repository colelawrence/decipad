# Computer/Language

The main language and computer docs are here
https://www.notion.so/decipad/Language-computer-internals-8ffe0fbb0a494570a911fefabfc37051#2fc2e93ee4354d1ba25fae252903b549

This markdown file here is a guide on how you would add the Computer to a document-based application. It is the same we do in the docs site, and decipad itself.

First, we need to create a computer and make it available everywhere in our app. In React you'd use a context, in jQuery you'd place it in `window.computer`, etc.

```js
computer = new Computer();
```

After, we need to subscribe to something, just to get some stuff in the console.

```js
// Get an Observable and log stuff
const subscription = computer.results$.observe().subscribe((allResults) => {
  console.log(allResults);
});
```

We should have no logs now! Let's push a computation request.

```js
// An "identified block" is the basis of the computer's input. It contains an ID that you can query it by.
const exampleBlock: IdentifiedBlock = {
  type: 'identified-block',
  id: 'my-first-block',
  // To parse an expression with a variable name separately, use
  // decilang`${{ name: 'MyVariable' }} = ${parseExpressionOrThrow('round(1.23)')}`
  // Because this enables you to use arbitrary variable names
  block: parseBlockOrThrow('MyVariable = round(1.23)'),
  // This is optional but highly recommended
  definesVariable: 'MyVariable',
};
// In a real application you want to call this every time something changes
computer.pushCompute({
  program: [exampleBlock],
});
```

After {requestDebounceMs} has passed, you will see results in your subscription!
