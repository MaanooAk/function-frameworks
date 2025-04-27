/**
 * Configuration object for lists_update.
 */
interface ListsUpdateOptions {
    /**
     * The attribute used to define list expressions on elements.
     * @default "data-list"
     */
    attr: string;

    /**
     * If true, the list definition is removed after it is processed.
     * @default false
     */
    consume: boolean;

    /**
     * The attribute used to store the original list definition after processing.
     * @default "data-listing"
     */
    reflect: string;

    /**
     * The separator string used to separate the list name from the expression.
     * @default " of "
     */
    separator: string;

    /**
     * If true, a container element (div/span) is expected inside the list element.
     * @default true
     */
    container: boolean;

    /**
     * A function that compiles a string expression into a function that provides list data.
     * @default (expr) => eval(`(self, context) => ${expr}`)
     */
    compiler: (expr: string) => (self: any, context: any) => any;

    /**
     * The default variable name to refer to the list item if not specified.
     * @default "self"
     */
    implicit: string;

    /**
     * The prefix used to find associated <template> elements by ID.
     * @default "template-"
     */
    prefix: string;

    /**
     * A function that generates a unique key for each item in the list.
     * @default (i) => i
     */
    key: (item: any) => any;

    /**
     * A function that creates an Element from an HTML template and item context.
     * @default (html, self) => window.template_inflate(html, self, { html: false }) || default_inflate
     */
    inflater: (html: string, self: any) => Element;

    /**
     * If true, assigns context data to each generated list item element.
     * @default true
     */
    context: boolean;

    /**
     * The property name used to lock each DOM element to its key.
     * @default "list_key"
     */
    lock: string;

    /**
     * If true, remembers options across multiple calls.
     * @default true
     */
    remember: boolean;

    /**
     * If true, resets remembered options.
     * @default false
     */
    reset: boolean;
}

/**
 * Updates lists based on template definitions and provided context.
 * 
 * @param {Document | Element | string} [root=document] - The root element or selector string to search under.
 * @param {Partial<ListsUpdateOptions>} [options] - Optional configuration to customize behavior.
 * @returns {boolean | void} - True if updates were made inside the root; otherwise void.
 */
declare function lists_update(root?: Document | Element | string, options?: Partial<ListsUpdateOptions>): boolean | void;
