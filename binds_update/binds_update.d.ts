
/** 
 * Types of bindings that are available for use in binding expressions. 
 */
declare type BindingTypes =
    | "html"
    | "text"
    | "value"
    | "checked"
    | "context"
    | "hidden"
    | "class-"
    | "attr-"
    | "var-";

/**
 * Configuration object for binds_update.
 */
interface BindsUpdateOptions {
    /**
     * The attribute used to define binding expressions on elements.
     * @default "data-bind"
     */
    attr: string;

    /**
     * If true, the binding expression is removed after it is processed.
     * @default false
     */
    consume: boolean;

    /**
     * The attribute used to store the original binding expression after processing.
     * @default "data-bond"
     */
    reflect: string;

    /**
     * The default binding type to use when no type is specified in the binding expression.
     * @default "html"
     */
    implicit: "html" | "text" | "value" | "checked" | "context" | "hidden";

    /**
     * The separator used for multiple binding expressions.
     * @default ";"
     */
    separator: string;

    /**
     * The separator used to separate the binding type and the expression in a binding.
     * @default ":"
     */
    binder: string;

    /**
     * A function to evaluate binding expressions. By default, it uses eval to compile expressions.
     * @default (expr) => eval(`(self, context) => ${expr}`)
     */
    compiler: (expr: string) => (self: any, context: any) => any;

    /**
     * If true, will update only elements that are currently visible.
     * @default false
     */
    visibility: boolean;

    /**
     * If true, remembers the options for future calls. If false, options are not remembered.
     * @default true
     */
    remember: boolean;

    /**
     * If true, resets any remembered options, clearing previously saved options.
     * @default false
     */
    reset: boolean;

    /**
     * If true, resets any remembered options, clearing previously saved options.
     * @default {}
     */
    extensions: Record<string, (element: Element, value: any) => any>;
}

/**
 * Bind expression with element properties for all root's children.
 * 
 * @param {Document | Element | string} [root=document] - Selector string or root element.
 * @param {Partial<BindsUpdateOptions>} options - Optional configuration options. 
 */
declare function binds_update(root?: Element | string, options?: Partial<BindsUpdateOptions>): void;
