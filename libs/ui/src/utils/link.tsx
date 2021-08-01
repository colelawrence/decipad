import { SerializedStyles } from '@emotion/react';
import { AnchorHTMLAttributes, ComponentProps } from 'react';
import { NavHashLink, HashLink } from 'react-router-hash-link';
import { useHasRouter } from './routing';

export const resolveHref = (
  href: string
): { internal: boolean; resolved: string } => {
  if (!globalThis.location) {
    return { internal: false, resolved: href };
  }

  const url = new URL(href, globalThis.location.href);
  if (url.origin === globalThis.location.origin) {
    return {
      internal: true,
      resolved: `${url.pathname}${url.search}${url.hash}`,
    };
  }
  return { internal: false, resolved: url.href };
};

const activeClassName = 'active';
type AnchorProps = {
  // hrefs may conditionally be undefined, but the prop is mandatory so it cannot be forgotten
  readonly href: string | undefined;
  readonly css?: SerializedStyles;
} & (
  | ({
      readonly activeStyles?: undefined;
      readonly exact?: undefined;
    } & Omit<ComponentProps<typeof HashLink>, 'to' | 'smooth'>)
  | ({
      readonly activeStyles: SerializedStyles;
      readonly exact?: boolean;
    } & Omit<
      ComponentProps<typeof NavHashLink>,
      'activeClassName' | 'to' | 'smooth'
    >)
  | ({
      readonly activeStyles?: undefined;
      readonly exact?: undefined;
    } & Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'target' | 'rel'
    >)
);
// ESLint does not understand the abstraction
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/jsx-no-target-blank */
export const Anchor: React.FC<AnchorProps> = ({
  href,
  activeStyles,
  exact,
  ...props
}) => {
  const { internal = false, resolved = href } = href ? resolveHref(href) : {};
  if (useHasRouter() && resolved && internal) {
    if (activeStyles) {
      return (
        <NavHashLink
          {...props}
          activeClassName={activeClassName}
          css={[props.css, { [`&.${activeClassName}`]: activeStyles }]}
          to={resolved}
          exact={exact}
          smooth
        />
      );
    }
    return <HashLink {...props} to={resolved} smooth />;
  }
  return (
    <a
      {...props}
      href={resolved}
      target={internal ? undefined : '_blank'}
      rel={internal ? undefined : 'noreferrer noopener'}
    />
  );
};
