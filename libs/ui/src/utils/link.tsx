/* eslint decipad/css-prop-named-variable: 0 */
import { SERVER_SIDE_ROUTES } from '@decipad/routing';
import { SerializedStyles } from '@emotion/react';
import { AnchorHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { matchRoutes, RouteObject } from 'react-router-dom';
import { HashLink, NavHashLink } from '@xzar90/react-router-hash-link';
import { useHasRouter } from './routing';

const SERVER_SIDE_ROUTE_OBJECTS: Array<RouteObject> =
  SERVER_SIDE_ROUTES.flatMap((route) => [
    // server side if it's a server side route ...
    route.template,
    // ... or any sub route of a server side route
    `${route.template}/*`,
  ]).map((path) => ({ path }));

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
  readonly children: ReactNode;
  // hrefs may conditionally be undefined, but the prop is mandatory so it cannot be forgotten
  readonly href: string | undefined;
  readonly className?: string;
} & (
  | ({
      // Non-nav HashLink
      readonly activeStyles?: undefined;
      readonly exact?: undefined;
    } & Omit<
      ComponentProps<typeof HashLink>,
      'children' | 'className' | 'to' | 'smooth' | 'style'
    >)
  | ({
      // NavHashLink
      readonly activeStyles: SerializedStyles;
      readonly exact?: boolean;
    } & Omit<
      ComponentProps<typeof NavHashLink>,
      'children' | 'className' | 'to' | 'smooth' | 'style'
    >)
  | ({
      // plain HTML anchor
      readonly activeStyles?: undefined;
      readonly exact?: undefined;
    } & Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      'children' | 'className' | 'href' | 'rel' | 'style' | 'target'
    >)
);
// ESLint does not understand the abstraction
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/jsx-no-target-blank */
export const Anchor: React.FC<AnchorProps> = ({
  href,
  activeStyles,
  exact,
  className,
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
    matchRoutes(SERVER_SIDE_ROUTE_OBJECTS, resolved) == null;

  if (hasRouter && resolved && sameApp) {
    const children = (
      <span
        className={className}
        css={[
          {
            width: '100%',
            height: '100%',
            display: 'block',
            [`.${activeClassName} > &`]: activeStyles,
          },
        ]}
      >
        {props.children}
      </span>
    );

    return activeStyles ? (
      <NavHashLink
        {...props}
        className={({ isActive }) => (isActive ? activeClassName : '')}
        to={resolved}
        end={exact}
        smooth
      >
        {children}
      </NavHashLink>
    ) : (
      <HashLink {...props} to={resolved} smooth>
        {children}
      </HashLink>
    );
  }

  return (
    <a
      {...props}
      className={className}
      href={resolved}
      target={sameApp ? undefined : '_blank'}
      rel={internal ? undefined : 'noreferrer noopener'}
    />
  );
};
