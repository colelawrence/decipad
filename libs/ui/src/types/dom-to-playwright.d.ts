declare module 'dom-to-playwright' {
  export default function domToPlaywright(
    page: Page,
    node?: Document | Element
  ): Promise<{
    select(element: Element): string;
    update(newNode: Document | Element): Promise<void>;
  }>;
}
