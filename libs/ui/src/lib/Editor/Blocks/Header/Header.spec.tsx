import React from 'react';
import { render } from 'test-utils';
import { Header } from './Header.component';

describe('Header Block', () => {
  it('renders', () => {
    const { container } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Hello World
      </Header>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Hello World
      </Header>
    );

    expect(container).toMatchSnapshot();
  });

  it('renders the correct h1 size', () => {
    const { getByText } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Hello World
      </Header>
    );

    expect(getByText('Hello World')).toHaveStyleRule(
      'font-size',
      'var(--chakra-fontSizes-4xl)'
    );
  });

  it('renders the correct h2 size', () => {
    const { getByText } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
        size="h2"
      >
        Hello World
      </Header>
    );

    expect(getByText('Hello World')).toHaveStyleRule(
      'font-size',
      'var(--chakra-fontSizes-3xl)'
    );
  });

  it('renders the correct h3 size', () => {
    const { getByText } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
        size="h3"
      >
        Hello World
      </Header>
    );

    expect(getByText('Hello World')).toHaveStyleRule(
      'font-size',
      'var(--chakra-fontSizes-2xl)'
    );
  });

  it('renders the correct h4 size', () => {
    const { getByText } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
        size="h4"
      >
        Hello World
      </Header>
    );

    expect(getByText('Hello World')).toHaveStyleRule(
      'font-size',
      'var(--chakra-fontSizes-xl)'
    );
  });

  it('renders the correct h5 size', () => {
    const { getByText } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
        size="h5"
      >
        Hello World
      </Header>
    );

    expect(getByText('Hello World')).toHaveStyleRule(
      'font-size',
      'var(--chakra-fontSizes-lg)'
    );
  });

  it('renders the correct h6 size', () => {
    const { getByText } = render(
      <Header
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
        size="h6"
      >
        Hello World
      </Header>
    );

    expect(getByText('Hello World')).toHaveStyleRule(
      'font-size',
      'var(--chakra-fontSizes-md)'
    );
  });
});
