# Frontend Docs

The frontend of decipad is a set of libraries/application packages that get together to create the full expected use experience.

Since Decipad is a monorepo, we have created multiple packages to split the frontend development into separate parts for ease of scope into the development and to promote organisation.

## Ui library

The ui library inside the `libs` folder is responsible for providing the project with all the different user interface components that are used in the application. Development of the ui library is guided by the [atomic design methodology](https://atomicdesign.bradfrost.com/chapter-2/) in that we split our components in atoms, molecules, organisms, templates and pages.

The ui library also provides design primitives for the components that are made, these include typography rules, color palette, dark mode compatibility, animations...etc. The purpose of the primitives is to ensure consistent design all accross the application with ease of change if design changes.

### Ui library guidelines

- No font size should be custom, primitives provides all the font sizes that should be used throughout the application.
- No custom color should be used, the primitives take the responsibility of providing all the colors.
- Styles creation is through emotion's `css` function style and not the `styled` function.
- No atoms should import each other, no lower hierarchial component can import an upper one, for example atoms can't import molecules, molecules can't import organisms..etc
- The library should only be exporting complete templates and pages, not small components like atoms.
- No data fetching occurs in the ui library, props should be used to pass data into the template/page and then on the actual frontend application data fetching happens and the data is put into the component's props.

### Examples of component creation

```typescript
import { ReactNode, FC } from 'react';
import { css } from '@emotion/react';
import { brand300, p13SemiBold } from '../../primitives';

const buttonStyles = css(p13SemiBold, {
  backgroundColor: brand300.rgb,
});

interface ButtonProps {
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({ children }) => {
  return (
    <button type="button" css={buttonStyles}>
      {children}
    </button>
  );
};
```

It is also ideal for every component to have their own test and story file, also make sure to export the component in the hierarchial `index.ts` file, for example `src/atoms/index.ts`.

### Example of story file

```typescript
import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { Button } from './Button';

const args: ComponentProps<typeof Button> = {
  children: 'Button',
};

const config: Meta<typeof args> = {
  title: 'Atoms / Button',
  component: Button,
  args,
};

export default config;

export const Normal: Story<typeof args> = (props) => <Button {...props} />;
```

### Example unit test

Unit tests are powered by jest and since our monorepo is managed by nx, you can easily target the tests for only the ui library and even run the unit test for a singular file.

To run the unit tests, you can do one of the following:

```bash
# This runs the test on the whole library
yarn nx test ui

# This runs the test on only a specific file
# For example this will match any file that has Button in the name
yarn nx test ui --testFile=Button
```

An example of writing a unit test for a component looks like this:

```javascript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button atom', () => {
  it('should render the children', () => {
    render(<Button>Hello World</Button>);

    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });
});
```

### Common folder locations

- Atoms -> `libs/ui/src/atoms`
- Molecules -> `libs/ui/src/molecules`
- Organisms -> `libs/ui/src/organisms`
- Templates -> `libs/ui/src/templates`
- Pages -> `libs/ui/src/pages`
- Primitives -> `libs/ui/src/primitives`
