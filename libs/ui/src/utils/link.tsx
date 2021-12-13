import { SerializedStyles } from '@emotion/react';
import { AnchorHTMLAttributes, ComponentProps } from 'react';
import { matchPath } from 'react-router-dom';
import { SERVER_SIDE_ROUTES } from '@decipad/routing';
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
  readonly role?: string;
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
  role = '',
  href,
  activeStyles,
  exact,
  ...props
}) => {
  const hasRouter = useHasRouter();
  const { internal = false, resolved = href } = href ? resolveHref(href) : {};

  // like href, resolved can still be falsy from here, indicating an empty href that does not navigate
  if (resolved) {
    if (
      hasRouter &&
      internal &&
      SERVER_SIDE_ROUTES.every(
        (route) => matchPath(resolved, { path: route.template }) == null
      )
    ) {
      if (activeStyles) {
        return (
          <NavHashLink
            {...props}
            className={role}
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
  }

  return (
    <a
      {...props}
      className={role}
      href={resolved}
      target={internal ? undefined : '_blank'}
      rel={internal ? undefined : 'noreferrer noopener'}
    />
  );
};
