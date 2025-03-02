import type { Document } from "./Document";
import type { DataStoreInterface, Migrations } from "./Types";

/**
 * Represents a collection of Documents, analogous to a DataStore.
 *
 * Warning: Multiple DocumentStores can be created for the same DataStore. You
 * should avoid this, as they will return different Document objects in
 * different sessions. If you need to access the same DocumentStore in multiple
 * scripts, create a module and require that module. Do not use DocumentService
 * with Actors or Parallel Luau.
 *
 * @template T - The type of the data.
 */
export class DocumentStore<T> {
	/** @returns If a given metatable passed is a DocumentStore. */
	public isDocumentStore: (instance: unknown) => boolean;

	/**
	 * Creates a new DocumentStore.
	 *
	 * Warning: This should only be called once per server for each DataStore in
	 * a live game. If there are multiple instances of a DocumentStore for one
	 * key, any Documents will be treated as if they are from different
	 * sessions. This is useful for unit testing but can lead to weird bugs in
	 * production. DocumentStores should persist through an entire server's
	 * lifespan and are not garbage collected.
	 *
	 * @template T - The type of the data.
	 * @param props - DocumentStoreProps to create the DocumentStore.
	 * @param props.bindToClose - Should the DocumentStore close all documents
	 *   on BindToClose? [default=true] (This should always be true in
	 *   production).
	 * @param props.check - A type check function for your data, errors if types
	 *   are invalid.
	 * @param props.dataStore - The object returned by
	 *   DataStoreService:GetDataStore().
	 * @param props.default - The default data to use if the key does not exist.
	 * @param props.lockSessions - Should the DocumentStore lock sessions?
	 *   [default=true].
	 * @param props.migrations - Migrations to run on the data.
	 * @returns DocumentStore<T>.
	 */
	constructor(props: {
		bindToClose: boolean | undefined;
		check: (data: unknown) => boolean | LuaTuple<[boolean, T?]>;
		dataStore: DataStoreInterface;
		default: T;
		lockSessions: boolean;
		migrations: Migrations | undefined;
	});

	/**
	 * Closes all open documents as fast as possible. This runs on BindToClose
	 * already.
	 *
	 * Will also wait for any documents that are opening to open, and then close
	 * them.
	 *
	 * Warning: Yields until all documents are closed. If there is a systematic
	 * error in your :Close, for example a hook errors, this could infinitely
	 * yield.
	 *
	 * Closes documents asynchronously when request budget allows, and yields
	 * all open documents are closed.
	 *
	 * @yields
	 */
	public CloseAllDocuments(): void;

	/**
	 * Gets the document for the key given, or creates one if it does not exist.
	 *
	 * Info: Documents are cached in a weak table, so once they are closed, they
	 * will be marked for garbage collection if you have no references to them.
	 * Be careful of references created by closures.
	 *
	 * Documents that are not session locked will be garbage collected once
	 * there are no other references to them.
	 *
	 * @param key - The key to get the document for.
	 * @returns Document<T>.
	 * @returns Boolean -- whether a new document was created.
	 */
	public GetDocument(key: string): LuaTuple<[document: Document<T>, created: boolean]>;
}
