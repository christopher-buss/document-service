/**
 * Update hooks will run on any operation that writes to Data Stores e.g.
 * :Save().
 *
 * Read hooks will run on any operation that reads from Data Stores e.g.
 * :Peek().
 */
export type HookEvent = "Close" | "Open" | "Read" | "Update";

/**
 * Subtype of Result. A success.
 *
 * @template T The type of the data.
 */
export interface Ok<T> {
	data: T;
	success: true;
}

/**
 * Subtype of Result. An error.
 *
 * @template E The type of the error.
 */
export interface Err<E> {
	reason: E;
	success: false;
}

/**
 * The result of a yielding operation that could error. You should always write
 * error handling for all types of errors that can be returned.
 *
 * @template T The type of the data.
 * @template E The type of the error.
 */
export type Result<T, E> = Err<E> | Ok<T>;

/** Indicates the Roblox API failed, e.g. Too many requests. */
export type RobloxAPIError = "RobloxAPIError";

/** Indicates the document was locked by some other session. */
export type SessionLockedError = "SessionLockedError";

/** Indicates the document's check function failed. */
export type CheckError = "CheckError";

/**
 * Attempted to load data that has been migrated ahead to a version that isn't
 * backwards compatible with the latest version our session has.
 */
export type BackwardsCompatibilityError = "BackwardsCompatibilityError";

/**
 * This indicates the key provided is not managed by DocumentService, or has
 * been corrupted.
 *
 * In the case of a SchemaError during opening, a new Document will be created,
 * enclosing the existing value at the key.
 */
export type SchemaError = "SchemaError";

/**
 * Data format versions start at 0. The first migration should migrate from 0 to
 * 1.
 *
 * If you have data existing in the key before you open a Document, this will be
 * considered version 0 and migrations will run.
 *
 * If backwardsCompatible is false, loading this version and later versions in
 * an older server without this migration defined will fail.
 *
 * The current version is defined by the length of this array.
 *
 * @note
 * If you make a not-backwards-compatible migration on not-session-locked
 * Documents, you must shut down all servers, or old servers will break.
 */
export type Migrations = Array<{
	backwardsCompatible: boolean;
	migrate: (data: unknown) => unknown;
}>;

/**
 * Takes data and returns an updated version of it. Ideally this should be a
 * pure function.
 *
 * @template T The type of the data.
 */
export type Transform<T> = (data: T) => T;

/**
 * An interface, implemented by DataStore in Roblox, to allow dependency
 * injection (e.g. MockDataStores).
 *
 * There is currently an issue where passing `DataStore` will result in a type
 * error, even though `DataStore` currently implements `DataStoreInterface`. You
 * can typecast to to any (:: any) as a workaround.
 */
export interface DataStoreInterface {
	GetAsync<T>(
		key: string,
		options?: DataStoreGetOptions,
	): LuaTuple<[T | undefined, DataStoreKeyInfo]>;
	RemoveAsync<T>(key: string): LuaTuple<[T | undefined, DataStoreKeyInfo | undefined]>;
	UpdateAsync<R>(
		key: string,
		transformFunction: (
			oldValue: unknown,
			keyInfo: DataStoreKeyInfo | undefined,
		) => LuaTuple<[updatedValue: R | undefined, userIds?: Array<number>, metadata?: object]>,
	): LuaTuple<[updatedValue: R | undefined, keyInfo: DataStoreKeyInfo]>;
}
