import { AnchorHTMLAttributes, ComponentProps } from 'react';
import { HashLink } from 'react-router-hash-link';
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

type AnchorProps = {
  // hrefs may conditionally be undefined, but the prop is mandatory so it cannot be forgotten
  readonly href: string | undefined;
} & (
  | Omit<ComponentProps<typeof HashLink>, 'to' | 'smooth'>
  | Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'>
);
// ESLint does not understand the abstraction
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/jsx-no-target-blank */
export const Anchor: React.FC<AnchorProps> = ({ href, ...props }) => {
  const { internal = false, resolved = href } = href ? resolveHref(href) : {};
  if (useHasRouter() && resolved && internal) {
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
