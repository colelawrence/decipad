import { SERVER_SIDE_ROUTES } from '@decipad/routing';
import { SerializedStyles } from '@emotion/react';
import { AnchorHTMLAttributes, ComponentProps } from 'react';
import { matchPath } from 'react-router-dom';
import { HashLink, NavHashLink } from 'react-router-hash-link';
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
  role = '',
  href,
  activeStyles,
  exact,
  ...props
}) => {
  /*
   * Logic table (please keep updated along with tests!):
   * href                 | hasRouter | activeStyles || anchor impl | target  | rel
   * internal             | false     | no           || a           | default | default
   * internal             | false     | yes          || a           | default | default
   * internal             | true      | no           || HashLink    |         |
   * internal             | true      | yes          || NavHashLink |         |
   * internal server-side | false     | no           || a           | _blank  | default
   * internal server-side | false     | yes          || a           | _blank  | default
   * internal server-side | true      | no           || a           | _blank  | default
   * internal server-side | true      | yes          || a           | _blank  | default
   * external             | false     | no           || a           | _blank  | secure
   * external             | false     | yes          || a           | _blank  | secure
   * external             | true      | no           || a           | _blank  | secure
   * external             | true      | yes          || a           | _blank  | secure
   */

  const hasRouter = useHasRouter();
  const { internal = false, resolved = href } = href ? resolveHref(href) : {};

  // like href, resolved can still be falsy from here, indicating an empty href that does not navigate

  const sameApp =
    resolved &&
    internal &&
    SERVER_SIDE_ROUTES.every(
      (route) => matchPath(resolved, { path: route.template }) == null
    );

  if (hasRouter && resolved && sameApp) {
    return activeStyles ? (
      <NavHashLink
        {...props}
        activeClassName={activeClassName}
        css={[props.css, { [`&.${activeClassName}`]: activeStyles }]}
        to={resolved}
        exact={exact}
        smooth
      />
    ) : (
      <HashLink {...props} to={resolved} smooth />
    );
  }

  return (
    <a
      {...props}
      href={resolved}
      target={sameApp ? undefined : '_blank'}
      rel={internal ? undefined : 'noreferrer noopener'}
    />
  );
};
