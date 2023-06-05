import { tableFlip } from './tableFlip';

it('flips array of objects to object with lists', () => {
  const myArrayObject = [
    {
      aKey: 123,
      anotherKey: 'hello',
    },
    {
      aKey: 420,
      anotherKey: 'world',
    },
  ];

  expect(tableFlip(myArrayObject)).toMatchInlineSnapshot(`
    Object {
      "aKey": Array [
        123,
        420,
      ],
      "anotherKey": Array [
        "hello",
        "world",
      ],
    }
  `);
});

it('flips array with items of dodgy types', () => {
  const myArrayObject = [
    {
      aKey: () => {
        // eslint-disable-next-line
      },
      anotherKey: console,
    },
    {
      aKey: [1, 2, 3],
      anotherKey: 'world',
    },
  ];

  expect(tableFlip(myArrayObject)).toMatchInlineSnapshot(`
    Object {
      "aKey": Array [],
      "anotherKey": Array [
        "world",
      ],
    }
  `);
});

it('Big json array', () => {
  const arr = [
    {
      category: 'History',
      type: 'multiple',
      difficulty: 'medium',
      question: 'The seed drill was invented by which British inventor?',
      correct_answer: 'Jethro Tull',
      incorrect_answers: ['Charles Babbage', 'Isaac Newton', 'J.J Thomson'],
    },
    {
      category: 'Entertainment: Books',
      type: 'multiple',
      difficulty: 'easy',
      question: '&quot;Green Eggs And Ham&quot; is a book by which author?',
      correct_answer: 'Dr. Seuss',
      incorrect_answers: ['Beatrix Potter', 'Roald Dahl', 'A.A. Milne'],
    },
    {
      category: 'Entertainment: Video Games',
      type: 'multiple',
      difficulty: 'easy',
      question:
        'How many times do you fight Gilgamesh in &quot;Final Fantasy 5&quot;?',
      correct_answer: '6',
      incorrect_answers: ['4', '5', '3'],
    },
    {
      category: 'Entertainment: Video Games',
      type: 'boolean',
      difficulty: 'easy',
      question:
        'In &quot;Sonic Adventure&quot;, you are able to transform into Super Sonic at will after completing the main story.',
      correct_answer: 'False',
      incorrect_answers: ['True'],
    },
    {
      category: 'History',
      type: 'multiple',
      difficulty: 'medium',
      question:
        'In what year did Kentucky become the 15th state to join the union?',
      correct_answer: '1792',
      incorrect_answers: ['1782', '1798', '1788'],
    },
    {
      category: 'Entertainment: Music',
      type: 'multiple',
      difficulty: 'easy',
      question: 'What is the frontman&#039;s name of the metal band Megadeth?',
      correct_answer: 'Dave Mustaine',
      incorrect_answers: ['Rob Halford', 'Vince Neil', 'James Hetfield'],
    },
    {
      category: 'Entertainment: Video Games',
      type: 'multiple',
      difficulty: 'easy',
      question: 'Which of the following is NOT a Nintendo game console?',
      correct_answer: 'Dreamcast',
      incorrect_answers: ['SNES', 'Wii', 'Switch'],
    },
    {
      category: 'Entertainment: Video Games',
      type: 'boolean',
      difficulty: 'easy',
      question:
        'In Until Dawn, both characters Sam and Mike cannot be killed under any means until the final chapter of the game.',
      correct_answer: 'True',
      incorrect_answers: ['False'],
    },
    {
      category: 'General Knowledge',
      type: 'multiple',
      difficulty: 'easy',
      question:
        'Foie gras is a French delicacy typically made from what part of a duck or goose?',
      correct_answer: 'Liver',
      incorrect_answers: ['Heart', 'Stomach', 'Intestines'],
    },
    {
      category: 'Entertainment: Film',
      type: 'multiple',
      difficulty: 'medium',
      question:
        'In the Mad Max franchise, what type of car is the Pursuit Special driven by Max?',
      correct_answer: 'Ford Falcon',
      incorrect_answers: [
        'Holden Monaro',
        'Chrysler Valiant Charger',
        'Pontiac Firebird',
      ],
    },
  ];

  expect(tableFlip(arr)).toMatchInlineSnapshot(`
    Object {
      "category": Array [
        "History",
        "Entertainment: Books",
        "Entertainment: Video Games",
        "Entertainment: Video Games",
        "History",
        "Entertainment: Music",
        "Entertainment: Video Games",
        "Entertainment: Video Games",
        "General Knowledge",
        "Entertainment: Film",
      ],
      "correct_answer": Array [
        "Jethro Tull",
        "Dr. Seuss",
        "6",
        "False",
        "1792",
        "Dave Mustaine",
        "Dreamcast",
        "True",
        "Liver",
        "Ford Falcon",
      ],
      "difficulty": Array [
        "medium",
        "easy",
        "easy",
        "easy",
        "medium",
        "easy",
        "easy",
        "easy",
        "easy",
        "medium",
      ],
      "incorrect_answers": Array [],
      "question": Array [
        "The seed drill was invented by which British inventor?",
        "&quot;Green Eggs And Ham&quot; is a book by which author?",
        "How many times do you fight Gilgamesh in &quot;Final Fantasy 5&quot;?",
        "In &quot;Sonic Adventure&quot;, you are able to transform into Super Sonic at will after completing the main story.",
        "In what year did Kentucky become the 15th state to join the union?",
        "What is the frontman&#039;s name of the metal band Megadeth?",
        "Which of the following is NOT a Nintendo game console?",
        "In Until Dawn, both characters Sam and Mike cannot be killed under any means until the final chapter of the game.",
        "Foie gras is a French delicacy typically made from what part of a duck or goose?",
        "In the Mad Max franchise, what type of car is the Pursuit Special driven by Max?",
      ],
      "type": Array [
        "multiple",
        "multiple",
        "multiple",
        "boolean",
        "multiple",
        "multiple",
        "multiple",
        "boolean",
        "multiple",
        "multiple",
      ],
    }
  `);
});

it.todo('Allows for nested structured');
