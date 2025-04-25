
/** Info object to identify and version an object */
export type StorageSyncInfo = {
    /** Storage key name (required for sync) */
    name: string;
    /** Current version of the object (default: 1) */
    version: number;
    /** Migration function(s) to upgrade older versions to current version */
    migrate: MigrateFunction | Record<string, MigrateFunction>;
    /** Whether to track this object for future saves (default: true) */
    track: boolean;
    /** Whether to load the object from storage immediately (default: true) */
    init: boolean;
};

/**
 * Type for the encoder function used to serialize the object.
 * @param object - The object to encode.
 * @param version - Current version number.
 * @param stringify - Stringify function (usually JSON.stringify).
 * @returns A string representation of the object with version prefix.
 */
type Encoder = (object: any, version: number, stringify: (obj: any) => string) => string;

/**
 * Type for the decoder function used to deserialize the stored string.
 * @param text - The encoded string retrieved from storage.
 * @param parse - Parse function (usually JSON.parse).
 * @returns An object with the parsed object and version.
 */
type Decoder = (text: string, parse: (text: string) => any) => { object: any; version: number };

/**
 * Type for the migration function used to convert old versions of the object.
 * @param oldObject - The stored object to migrate.
 * @param fromVersion - The version of the stored object.
 * @param toVersion - The current version expected.
 * @returns A new migrated object, or null/undefined if migration failed.
 */
type MigrateFunction = (oldObject: any, fromVersion: number, toVersion: number) => any;

/** Configuration object for synchronization behavior */
export type StorageSyncOptions = {
    /** Key prefix for stored items (default: "Storage") */
    prefix: string;
    /** Storage to use (default: localStorage) */
    storage: StorageLike;
    /** Custom encoder to convert object to string with version */
    encoder: Encoder;
    /** Custom decoder to convert stored string back to object */
    decoder: Decoder;
    /** Custom stringify function (default: JSON.stringify) */
    stringify: (obj: any) => string;
    /** Custom parse function (default: JSON.parse) */
    parse: (text: string) => any;
    /** Whether to remember these options across calls (default: true) */
    remember: boolean;
    /** Whether to reset remembered options (default: false) */
    reset: boolean;
    /** Whether to track this object for future auto-saving (default: true) */
    track: boolean;
    /** Whether to load initial value from storage (default: true) */
    init: boolean;
};

/**
 * Interface for any storage backend that behaves like localStorage.
 */
interface StorageLike {
    [key: string]: string;
}

/**
 * Synchronize objects with the localStorage.
 *
 * - If called with no arguments, stores all tracked objects.
 * - If called with just an object, stores that specific tracked object.
 * - If called with object + info/options, will store/load/migrate accordingly.
 *
 * @param {Object} object - The object to synchronize.
 * @param {string|Partial<StorageSyncInfo>} [info] - Name of the object in storage or an info object.
 * @param {Partial<StorageSyncOptions>} [options] - Optional configuration options.
 */
declare function storage_sync(
    object?: object,
    info?: string | Partial<StorageSyncInfo>,
    options?: Partial<StorageSyncOptions>
): void;
