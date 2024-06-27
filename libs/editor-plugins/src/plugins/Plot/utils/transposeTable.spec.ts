import { describe, expect, test } from 'vitest';
import { FlipTableResult, transposeTable } from './transposeTable';

describe('transposeTable', () => {
  test('should return an error for invalid data', () => {
    const result: FlipTableResult = transposeTable(null as any);
    expect(result.ok).toBe(false);
    // @ts-ignore
    expect(result.reason).toBe('Invalid table');
  });

  test('should return the original table if empty', () => {
    const result: FlipTableResult = transposeTable([] as any);
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.data).toMatchObject([]);
    // @ts-ignore
    expect(result.columnTypes).toMatchObject([]);
    // @ts-ignore
    expect(result.columnNames).toMatchObject([]);
  });

  test('should return an error for exceeding maximum rows', () => {
    const data = Array.from({ length: 21 }, (_, i) => ({
      Name: `Player ${i}`,
    }));
    const result: FlipTableResult = transposeTable(data);
    expect(result.ok).toBe(false);
    // @ts-ignore
    expect(result.reason).toBe(
      'We do not support flipping more than 20, but this table has 21.'
    );
  });

  test('should return an error for non-number columns', () => {
    const data = [
      { Name: 'Player 1', Age: 'Twenty' },
      { Name: 'Player 2', Age: 'Thirty' },
    ];
    const result: FlipTableResult = transposeTable(data);
    expect(result.ok).toBe(false);
    // @ts-ignore
    expect(result.reason).toBe(
      'You can only flip tables when all selected columns are numbers, as otherwise we cannot plot it'
    );
  });

  test('should be able to transpose simple case', () => {
    const data = [{ Name: 'Person 1', Age: 20 }];
    const result: FlipTableResult = transposeTable(data);
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.data).toMatchObject([{ Key: 'Age', 'Person 1': 20 }]);
    // @ts-ignore
    expect(result.columnTypes).toMatchObject([
      { kind: 'string' },
      { kind: 'number', unit: null },
    ]);
    // @ts-ignore
    expect(result.columnNames).toMatchObject(['Key', 'Person 1']);
  });

  test('transpose footballers table', () => {
    const data = [
      {
        Name: 'Lamine Yamal',
        Shooting: 72,
        Passing: 68,
        Dribbling: 81,
        Defensive: 23,
        Physical: 48,
        Pace: 82,
      },
      {
        Name: 'Kai Havertz',
        Shooting: 81,
        Passing: 79,
        Dribbling: 83,
        Defensive: 49,
        Physical: 70,
        Pace: 78,
      },
      {
        Name: 'Khvicha Kvaratskhelia',
        Shooting: 79,
        Passing: 81,
        Dribbling: 87,
        Defensive: 41,
        Physical: 71,
        Pace: 86,
      },
      {
        Name: 'Jamal Musiala',
        Shooting: 75,
        Passing: 76,
        Dribbling: 91,
        Defensive: 63,
        Physical: 61,
        Pace: 85,
      },
      {
        Name: 'Rafael Leão',
        Shooting: 78,
        Passing: 79,
        Dribbling: 88,
        Defensive: 28,
        Physical: 77,
        Pace: 93,
      },
    ];

    const result: FlipTableResult = transposeTable(data);
    // @ts-ignore
    expect(result.reason).toBe(undefined);
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.data).toMatchObject([
      {
        Key: 'Shooting',
        'Lamine Yamal': 72,
        'Kai Havertz': 81,
        'Khvicha Kvaratskhelia': 79,
        'Jamal Musiala': 75,
        'Rafael Leão': 78,
      },
      {
        Key: 'Passing',
        'Lamine Yamal': 68,
        'Kai Havertz': 79,
        'Khvicha Kvaratskhelia': 81,
        'Jamal Musiala': 76,
        'Rafael Leão': 79,
      },
      {
        Key: 'Dribbling',
        'Lamine Yamal': 81,
        'Kai Havertz': 83,
        'Khvicha Kvaratskhelia': 87,
        'Jamal Musiala': 91,
        'Rafael Leão': 88,
      },
      {
        Key: 'Defensive',
        'Lamine Yamal': 23,
        'Kai Havertz': 49,
        'Khvicha Kvaratskhelia': 41,
        'Jamal Musiala': 63,
        'Rafael Leão': 28,
      },
      {
        Key: 'Physical',
        'Lamine Yamal': 48,
        'Kai Havertz': 70,
        'Khvicha Kvaratskhelia': 71,
        'Jamal Musiala': 61,
        'Rafael Leão': 77,
      },
      {
        Key: 'Pace',
        'Lamine Yamal': 82,
        'Kai Havertz': 78,
        'Khvicha Kvaratskhelia': 86,
        'Jamal Musiala': 85,
        'Rafael Leão': 93,
      },
    ]);
    // @ts-ignore
    expect(result.columnNames).toMatchObject([
      'Key',
      'Lamine Yamal',
      'Kai Havertz',
      'Khvicha Kvaratskhelia',
      'Jamal Musiala',
      'Rafael Leão',
    ]);
    // @ts-ignore
    expect(result.columnTypes).toEqual([
      { kind: 'string' },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
    ]);
    // @ts-ignore
    expect(result.columnTypes.length).toEqual(result.columnNames.length);
  });

  test('transpose shares table', () => {
    const data = [
      {
        Shares: 5000000,
        Shareholder: 'Joanne',
        Perc: 0.188679245283019,
      },
      {
        Shares: 15000000,
        Shareholder: 'Isabelle',
        Perc: 0.566037735849057,
      },
      {
        Shares: 4000000,
        Shareholder: 'Marsha',
        Perc: 0.150943396226415,
      },
      {
        Shares: 2500000,
        Shareholder: 'Tricapital',
        Perc: 0.094339622641509,
      },
    ];

    const result: FlipTableResult = transposeTable(data);
    // @ts-ignore
    expect(result.reason).toBe(undefined);
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.data).toMatchObject([
      {
        Key: 'Shares',
        Joanne: 5000000,
        Isabelle: 15000000,
        Marsha: 4000000,
        Tricapital: 2500000,
      },
      {
        Key: 'Perc',
        Joanne: 0.188679245283019,
        Isabelle: 0.566037735849057,
        Marsha: 0.150943396226415,
        Tricapital: 0.094339622641509,
      },
    ]);
    // @ts-ignore
    expect(result.columnNames).toMatchObject([
      'Key',
      'Joanne',
      'Isabelle',
      'Marsha',
      'Tricapital',
    ]);
    // @ts-ignore
    expect(result.columnTypes).toEqual([
      { kind: 'string' },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
    ]);
    // @ts-ignore
    expect(result.columnTypes.length).toEqual(result.columnNames.length);
  });

  test('transpose item table (item)', () => {
    const data = [
      {
        Item: 'Shoes',
        Amount: 50,
        UnitPrice: 50,
        Subtotal: 2500,
        Total: 3000,
      },
      {
        Item: 'Wine',
        Amount: 190,
        UnitPrice: 8,
        Subtotal: 1520,
        Total: 1824,
      },
      {
        Item: 'Auditorium',
        Amount: 1,
        UnitPrice: 5400,
        Subtotal: 5400,
        Total: 6480,
      },
      {
        Item: 'Tea',
        Amount: 50,
        UnitPrice: 4,
        Subtotal: 200,
        Total: 240,
      },
      {
        Item: 'Food',
        Amount: 50,
        UnitPrice: 12,
        Subtotal: 600,
        Total: 720,
      },
      {
        Item: 'Wine',
        Amount: 20,
        UnitPrice: 12,
        Subtotal: 240,
        Total: 288,
      },
      {
        Item: 'Tea',
        Amount: 5,
        UnitPrice: 6,
        Subtotal: 30,
        Total: 36,
      },
    ];

    const result: FlipTableResult = transposeTable(data);
    // @ts-ignore
    expect(result.reason).toBe(undefined);
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.data).toMatchObject([
      {
        Key: 'Amount',
        Shoes: 50,
        Wine: 210,
        Auditorium: 1,
        Tea: 55,
        Food: 50,
      },
      {
        Key: 'UnitPrice',
        Shoes: 50,
        Wine: 20,
        Auditorium: 5400,
        Tea: 10,
        Food: 12,
      },
      {
        Key: 'Subtotal',
        Shoes: 2500,
        Wine: 1760,
        Auditorium: 5400,
        Tea: 230,
        Food: 600,
      },
      {
        Key: 'Total',
        Shoes: 3000,
        Wine: 2112,
        Auditorium: 6480,
        Tea: 276,
        Food: 720,
      },
    ]);
    // @ts-ignore
    expect(result.columnNames).toMatchObject([
      'Key',
      'Shoes',
      'Wine',
      'Auditorium',
      'Tea',
      'Food',
    ]);
    // @ts-ignore
    expect(result.columnTypes).toEqual([
      { kind: 'string' },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
    ]);
    // @ts-ignore
    expect(result.columnTypes.length).toEqual(result.columnNames.length);
  });

  test('transpose companies table', () => {
    const data = [
      {
        Company: 'ACME Inc',
        Opportunity: 500000,
        Booked: 250000,
        Realized: 0,
      },
      {
        Company: 'Dunder Mif',
        Opportunity: 750000,
        Booked: 750000,
        Realized: 750000,
      },
      {
        Company: 'Retry Inc',
        Opportunity: 40000,
        Booked: 100000,
        Realized: 100000,
      },
      {
        Company: 'Wegovy Capital',
        Opportunity: 1500000,
        Booked: 500000,
        Realized: 5000,
      },
      {
        Company: 'Tronter LLC',
        Opportunity: 430234,
        Booked: 350000,
        Realized: 150000,
      },
      {
        Company: 'Ewww Inc.',
        Opportunity: 450000,
        Booked: 450000,
        Realized: 450000,
      },
      {
        Company: 'Pongyan Ltd',
        Opportunity: 32000,
        Booked: 10000,
        Realized: 5000,
      },
      {
        Company: 'Qovan Inc',
        Opportunity: 850000,
        Booked: 0,
        Realized: 0,
      },
      {
        Company: 'Marshmeme Inc',
        Opportunity: 350000,
        Booked: 0,
        Realized: 0,
      },
      {
        Company: 'UgeEgu',
        Opportunity: 100000,
        Booked: 15000,
        Realized: 0,
      },
    ];

    const result = transposeTable(data);
    // @ts-ignore
    expect(result.reason).toBe(undefined);
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.data).toMatchObject([
      {
        Key: 'Opportunity',
        'ACME Inc': 500000,
        'Dunder Mif': 750000,
        'Retry Inc': 40000,
        'Wegovy Capital': 1500000,
        'Tronter LLC': 430234,
        'Ewww Inc.': 450000,
        'Pongyan Ltd': 32000,
        'Qovan Inc': 850000,
        'Marshmeme Inc': 350000,
        UgeEgu: 100000,
      },
      {
        Key: 'Booked',
        'ACME Inc': 250000,
        'Dunder Mif': 750000,
        'Retry Inc': 100000,
        'Wegovy Capital': 500000,
        'Tronter LLC': 350000,
        'Ewww Inc.': 450000,
        'Pongyan Ltd': 10000,
        'Qovan Inc': 0,
        'Marshmeme Inc': 0,
        UgeEgu: 15000,
      },
      {
        Key: 'Realized',
        'ACME Inc': 0,
        'Dunder Mif': 750000,
        'Retry Inc': 100000,
        'Wegovy Capital': 5000,
        'Tronter LLC': 150000,
        'Ewww Inc.': 450000,
        'Pongyan Ltd': 5000,
        'Qovan Inc': 0,
        'Marshmeme Inc': 0,
        UgeEgu: 0,
      },
    ]);
    // @ts-ignore
    expect(result.columnNames).toMatchObject([
      'Key',
      'ACME Inc',
      'Dunder Mif',
      'Retry Inc',
      'Wegovy Capital',
      'Tronter LLC',
      'Ewww Inc.',
      'Pongyan Ltd',
      'Qovan Inc',
      'Marshmeme Inc',
      'UgeEgu',
    ]);
    // @ts-ignore
    expect(result.columnTypes).toEqual([
      { kind: 'string' },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
    ]);
    // @ts-ignore
    expect(result.columnTypes.length).toEqual(result.columnNames.length);
  });
});
