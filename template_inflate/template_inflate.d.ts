
type TemplateHandler = (expr: string, self: any, index: number) => string | number | HTMLElement;
type TemplateRenderer = (html: string) => HTMLElement;

interface TemplateInflateOptions {
    /** Opening delimiter for expressions. Default: "{{" */
    open: string;
    /** Closing delimiter for expressions. Default: "}}" */
    close: string;
    /** Whether to trim whitespace from inside expressions before evaluation. Default: false */
    trim: boolean;
    /** Function to evaluate expressions. */
    handler: TemplateHandler;
    /** If true, returns a string; if false, returns a rendered HTMLElement. Default: true */
    html: boolean;
    /** Function used to render HTML into a DOM element when `html` is false. */
    renderer: TemplateRenderer;
    /** Whether to cache parsed templates. Default: true */
    cache: boolean;
    /** If true, remembers the latest options and merges them on future calls. Default: true */
    remember: boolean;
}

/**
 * Inflate a template by evaluating embedded expressions.
 *
 * @param {string | HTMLTemplateElement | HTMLElement} template - A template string or a DOM element.
 * @param {any} self - The context object used to evaluate expressions.
 * @param {Partial<TemplateInflateOptions>} [options] - Optional configuration options.
 * @returns {string | HTMLElement} The resulting HTML string or DOM element, depending on the `html` option.
 */
declare function template_inflate(
    template: string | HTMLTemplateElement | HTMLElement,
    self: any,
    options?: Partial<TemplateInflateOptions>
): string | HTMLElement;
