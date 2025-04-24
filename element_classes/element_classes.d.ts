

declare class ElementClasses {

    /** One of the elements must have the given class */
    one(name: string): ElementClasses;
    /** One of the elements must have the given class */
    exactlyOne(name: string): ElementClasses;
    /** At least one of the elements must have the given class */
    atLeastOne(name: string): ElementClasses;
    /** At most one of the elements must have the given class */
    atMostOne(name: string): ElementClasses;
    /** A number of elements between the given min and max must have the given class */
    between(min: number, max: number, name: string): ElementClasses;

    /** Each element must have one of the given classes */
    each(...names: string[]): ElementClasses;
    /** Each element must have one of the given classes */
    eachExactlyOne(...names: string[]): ElementClasses;
    /** Each element must have at least one of the given classes */
    eachAtLeastOne(...names: string[]): ElementClasses;
    /** Each element must have at most one of the given classes */
    eachAtMostOne(...names: string[]): ElementClasses;
    /** Each element must have a number of given classes between the given min and max */
    eachBetween(min: number, max: number, ...names: string[]): ElementClasses;
}


/**
 * Define constraints that should be applied to the classes of a collection of elements. 
 * 
 * @param {string | Element[] | NodeList} elements - Selector string or array of elements.
 * @returns {ElementClasses} Instance of ElementClasses to define the constraints.
 */
declare function element_classes(elements: string | Element[] | NodeList): ElementClasses;