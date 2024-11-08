import type {
	BackwardsCompatibilityError,
	CheckError,
	DataStoreInterface,
	HookEvent,
	Migrations,
	Result,
	RobloxAPIError,
	SchemaError,
	SessionLockedError,
	Transform,
} from "./Types";

export type OpenResult<T> = Result<
	T,
	BackwardsCompatibilityError | CheckError | RobloxAPIError | SessionLockedError
>;

export type WriteResult<T> = Result<T, RobloxAPIError | SchemaError | SessionLockedError>;

/**
 * An abstraction over keys in a DataStore.
 *
 * Documents are designed to contain information about an entity in a schema.
 * This schema is enforced by your check function, and should be changed through
 * migrations. You may, of course, decide to not use a schema by defining an
 * empty check function, but this generally isn't recommended.
 *
 * Session locking prevents your data from being edited by multiple servers, and
 * ensures one server is finished with it before it is opened by another.
 *
 * In DocumentService, session locking enables the use of the caching methods
 * `SetCache` and `GetCache`.
 *
 * This is ideal for player data, or any data that needs frequent updates and
 * does not need multi-server editing.
 *
 * You are free to edit the contents of the table in the .data field with a tool
 * like DataStore Editor, but manually changing other fields could cause data
 * loss and errors.
 *
 * Types for your data are provided under the assumption that once a document is
 * opened, the underlying data held in Data Stores is not updated externally in
 * a way that changes its type.
 *
 * @template T The type of the data.
 */
export class Document<T> {
	constructor(props: {
		check: (data: unknown) => LuaTuple<[boolean, T]>;
		dataStore: DataStoreInterface;
		default: T;
		key: string;
		lockSessions: boolean;
		migrations: Migrations;
	});

	/**
	 * Closes the document, so it cannot be edited.
	 *
	 * The document must be open before using this method.
	 *
	 * If session locked, will save the document, remove the lock, and cancel
	 * autosaves first. If this fails, the document will not be closed.
	 *
	 * @yields
	 * @returns WriteResult<T | undefined>.
	 */
	public Close(): WriteResult<T | undefined>;

	/**
	 * Erases all data associated with the key.
	 *
	 * The document must not be open. It is up to you to check if the document
	 * is open elsewhere, e.g. Via `IsOpenAvailable`.
	 *
	 * Satisfies compliance with GDPR right of erasure.
	 *
	 * Does not run hooks.
	 *
	 * @yields
	 * @returns Result<undefined, RobloxAPIError>.
	 */
	public Erase(): Result<undefined, RobloxAPIError>;

	/**
	 * Retrieves the cache.
	 *
	 * The document must be open before using this method. You can only use
	 * cache for session-locked data.
	 *
	 * Info: You must use immutable operations on cache, i.e. Clone any table
	 * you intend to edit..
	 *
	 * @returns - Data from the cache.
	 */
	public GetCache(): T;

	/**
	 * Attaches a hook which occurs after the event, before the method returns.
	 *
	 * Note that if a hook yields, it will yield all methods that call it. Hooks
	 * are called in the order they are added.
	 *
	 * Hooks added with HookAfter only run if the operation is successful, and
	 * cannot mutate the result.
	 *
	 * @param event - The operation to call the hook after.
	 * @param hook - A hook function that receives the arguments passed in to
	 *   the operation.
	 * @returns Cleanup - A callback that removes the hook from the given hook
	 *   event registry.
	 */
	public HookAfter(event: HookEvent, hook: () => void): () => void;

	/**
	 * Attaches a hook which occurs before the event.
	 *
	 * Note that if a hook yields, it will yield all methods that call it. Hooks
	 * are called in the order they are added.
	 *
	 * Hooks cannot currently mutate arguments.
	 *
	 * @param event - The operation to call the hook before.
	 * @param hook - A hook function that receives the arguments passed in to
	 *   the operation.
	 * @returns Cleanup - a callback that removes the hook from the given hook
	 *   event registry.
	 */
	public HookBefore(event: HookEvent, hook: () => void): () => void;

	/**
	 * Attaches a hook which occurs after an event fails.
	 *
	 * Note that fail hooks only run when a method returns an Err<E> type. They
	 * will not run if the method throws a Luau error due to incorrect usage.
	 *
	 * @param event - The operation to call the hook after.
	 * @param hook - A hook function that receives the arguments passed in to
	 *   the operation.
	 * @returns Cleanup - A callback that removes the hook from the given hook
	 *   event registry.
	 */
	public HookFail(event: HookEvent, hook: () => void): () => void;

	/** @returns True if '.Close' has been called and is incomplete. */
	public IsClosing(): boolean;

	/**
	 * Checks if a metatable passed is a Document.
	 *
	 * @param instance - The metatable to check.
	 * @returns Boolean - True if the metatable is a Document, false otherwise.
	 */
	public isDocument: (instance: unknown) => boolean;

	/** @returns Whether the Document is open or not. */
	public IsOpen(): boolean;

	/**
	 * Returns a false Result if Document is currently open, locked by another
	 * session, otherwise returns a true Result.
	 *
	 * If props.lockSessions is false, this will always return a true Result.
	 *
	 * You can use this to check if a player is active to avoid data loss while
	 * editing data from another server.
	 *
	 * @yields
	 * @returns Result<boolean, RobloxAPIError>.
	 */
	public IsOpenAvailable(): Result<boolean, RobloxAPIError>;

	/**
	 * Attaches a single-use hook which occurs after the event, before the
	 * method returns.
	 *
	 * @param event - The operation to call the hook after.
	 * @param hook - A hook function that receives the arguments passed in to
	 *   the operation.
	 */
	public OnceAfter(event: HookEvent, hook: () => void): void;

	/**
	 * Attaches a single-use hook which occurs before the event.
	 *
	 * @param event - The operation to call the hook before.
	 * @param hook - A hook function that receives the arguments passed in to
	 *   the operation.
	 */
	public OnceBefore(event: HookEvent, hook: () => void): void;

	/**
	 * Attaches a single-use hook which occurs after an event fails.
	 *
	 * @param event - The operation to call the hook after.
	 * @param hook - A hook function that receives the arguments passed in to
	 *   the operation.
	 */
	public OnceFail(event: HookEvent, hook: () => void): void;

	/**
	 * Validates the document if one exists, creates a default document if no
	 * document exists, or creates a document with the data that is in the given
	 * key if the key hasn't been used with DocumentService before.
	 *
	 * Opening a session-locked document will enable periodic autosaves until it
	 * is closed.
	 *
	 * You must open a document before reading or writing to it.
	 *
	 * If the document is locked by another session, this method will wait and
	 * retry up to 5 times, and yields until the retries are exhausted or the
	 * lock is removed. Therefore, you should not use this method to check if
	 * the Document is being used by another session.
	 *
	 * You should check the value of `success`, and handle failures by checking
	 * the value of `reason`. The possible `reason`s for each method are defined
	 * in the return type.
	 *
	 * @yields
	 * @returns OpenResult<T>.
	 */
	public Open(): OpenResult<T>;

	/**
	 * Opens, and also runs a transform function on the data. Useful for
	 * non-session-locked data for shared entities, where one-off updates might
	 * be needed.
	 *
	 * Will throw a Luau error if the transform produces invalid or unsavable
	 * data.
	 *
	 * Runs both Open and Update hooks, including fail hooks.
	 *
	 * @param transform - The transform function to run on the data.
	 * @yields
	 * @returns OpenResult<T>.
	 */
	public OpenAndUpdate(transform: Transform<T>): OpenResult<T>;

	/**
	 * Reads the latest data stored in Data Stores.
	 *
	 * Runs migrations and the check function, but does not save changes.
	 *
	 * This may be called while the document is not open.
	 *
	 * Warning: A `SchemaError` will be returned if document has never been
	 * opened before, so it is strongly recommended to handle this case, and
	 * Open the document before reading it if possible. This includes when
	 * migrating from no library.
	 *
	 * Runs Read hooks.
	 *
	 * @yields
	 * @returns Result<any, RobloxAPIError | SchemaError | CheckError |
	 *   BackwardsCompatibilityError>.
	 */
	public Read(): Result<
		T,
		BackwardsCompatibilityError | CheckError | RobloxAPIError | SchemaError
	>;

	/**
	 * Saves a Document's cache to its DataStore. Equivalent to calling Update
	 * without transforming the data.
	 *
	 * The document must be open and locked to use this method.
	 *
	 * @yields
	 * @returns WriteResult<T>.
	 */
	public Save(): WriteResult<T>;

	/**
	 * Sets the cache.
	 *
	 * The document must be open before using this method. You can only use
	 * cache for session-locked data.
	 *
	 * Warning: Your cache should always pass your check function, otherwise
	 * autosaves may error.
	 *
	 * Info: You must use immutable operations on cache, i.e. Clone any table
	 * you intend to edit..
	 *
	 * @param cacheToSet - The cache to set that must pass the check function.
	 * @returns T - A deep frozen copy of the cache.
	 */
	public SetCache(cacheToSet: T): T;

	/**
	 * Marks the lock as stolen. The next `:Open` call will ignore any existing
	 * locks.
	 *
	 * Generally, it is recommended to call `:Steal` and then `:Open` in the
	 * case that the initial `:Open` fails due to `SessionLockedError`.
	 *
	 * Do not use this unless you are very sure the previous session is dead, or
	 * you could cause data loss. Only usable on session-locked Documents.
	 */
	public Steal(): void;

	/**
	 * Performs an atomic transaction on the Document, writing to the DataStore.
	 *
	 * The document must be open before using this method.
	 *
	 * If using session locking, transforms will build on cached data.
	 *
	 * Throws if data is not storable or the transform return value is invalid.
	 *
	 * Warning: The transform function must not yield, and shouldn't rely on any
	 * data from outside. It must follow the rules of what is storable in Data
	 * Stores.
	 *
	 * Warning: Assumes the data that is already in Data Stores is valid since
	 * the last `:Open`. If it isn't, and this is not corrected by the
	 * transform, this method will throw a luau error.
	 *
	 * Warning: If you are using session locking, your transform needs to use
	 * immutable operations (in the same way updating cache does).
	 *
	 * Warning: If your transform errors, the update will be aborted and the
	 * error will be thrown in a new thread (this is Roblox behaviour).
	 *
	 * Info: Unlike `Open`, this method will not retry if the lock is stolen,
	 * and will instead return a `SessionLockedError` after the first attempt.
	 *
	 * @param transform - Transform function for the transaction.
	 * @yields
	 * @returns WriteResult<T>.
	 */
	public Update(transform: Transform<T>): WriteResult<T>;
}
