type Attrs = Record<string, string | number | boolean>;

export function createElement<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options: {
    className?: string;
    text?: string;
    attrs?: Attrs;
  } = {},
) {
  const element = document.createElement(tag);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text) {
    element.textContent = options.text;
  }
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value === false || value === null || value === undefined) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, String(value));
      }
    });
  }
  return element;
}

export function mount(parent: HTMLElement, children: Array<Node | string>) {
  children.forEach(child => {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else {
      parent.appendChild(child);
    }
  });
}
