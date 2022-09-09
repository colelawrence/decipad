const isHtmlElement = (node: Node): node is HTMLElement => {
  return node instanceof HTMLElement && !(node instanceof Text);
};

let initialized = false;
let animating = false;
let observer: MutationObserver;

const animatingNodes = new WeakSet<Node>();

const animate = (node: Node) => {
  if (isHtmlElement(node)) {
    if (animatingNodes.has(node) || node.getAttribute('data-no-animate')) {
      return;
    }
    animatingNodes.add(node);
    const beforeStyle = node.getAttribute('style');
    node.setAttribute(
      'style',
      'background-color: #f8ffb4; transition: background-color 0.5s ease-in-out'
    );
    setTimeout(() => {
      node.setAttribute(
        'style',
        'background-color: transparent; transition: background-color 0.5s ease-in-out'
      );
      setTimeout(() => {
        if (beforeStyle != null) {
          node.setAttribute('style', beforeStyle);
        } else {
          node.removeAttribute('style');
        }
        animatingNodes.delete(node);
      }, 1000);
    }, 2000);
  }
};

const shouldRecurse = (node: Element): boolean =>
  node.getAttribute('data-stop-animate-query') === null;

const shouldAnimate = (node: Node): boolean => {
  if (!isHtmlElement(node)) {
    return false;
  }
  return (
    node.getAttribute('data-highlight-changes') === 'true' ||
    (node.parentElement != null &&
      shouldRecurse(node.parentElement) &&
      shouldAnimate(node.parentElement))
  );
};

const animateParentNode = (node: Node) => {
  // if (isHtmlElement(node)) {
  if (shouldAnimate(node) && node.parentElement) {
    animate(node.parentElement);
  }
  // }
};

const onMutation: MutationCallback = (mutations: MutationRecord[]) => {
  if (animating) {
    return;
  }
  animating = true;
  requestAnimationFrame(() => {
    try {
      for (const mutation of mutations) {
        if (mutation.target.parentElement) {
          animateParentNode(mutation.target.parentElement);
        }
      }
    } catch (err) {
      console.error('Error animating mutation:', err);
    } finally {
      animating = false;
    }
  });
};

const observe = (root: Node) => {
  observer = new MutationObserver(onMutation);
  observer.observe(root, {
    subtree: true,
    // childList: true,
    attributes: false,
    characterData: true,
    // attributeFilter: ['data-slate-node'],
  });

  initialized = true;
};

const schedule = () => {
  setTimeout(() => {
    const editor = document.querySelector('[data-slate-editor="true"]');
    if (!editor) {
      schedule();
    } else {
      observe(editor);
    }
  }, 1000);
};

export const animateMutations = () => {
  if (initialized) {
    return;
  }
  schedule();
  initialized = true;
};

export const stopAnimatingMutations = () => {
  if (observer) {
    observer.disconnect();
  }
  initialized = false;
};
