import type Document from "Document";
import type { DataStoreInterface, Migrations } from "Types";

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
interface DocumentStore<T> {
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
	CloseAllDocuments(): void;

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
	GetDocument(key: string): LuaTuple<[document: Document<T>, created: boolean]>;

	/** @returns If a given metatable passed is a DocumentStore. */
	isDocumentStore: (instance: unknown) => boolean;
}

/**
 * Creates a new DocumentStore.
 *
 * Warning: This should only be called once per server for each DataStore in a
 * live game. If there are multiple instances of a DocumentStore for one key,
 * any Documents will be treated as if they are from different sessions. This is
 * useful for unit testing but can lead to weird bugs in production.
 * DocumentStores should persist through an entire server's lifespan and are not
 * garbage collected.
 *
 * @template T - The type of the data.
 * @param props - DocumentStoreProps to create the DocumentStore.
 * @returns DocumentStore<T>.
 */
type DocumentStoreConstructor<T> = new (props: {
	check: (data: unknown) => LuaTuple<[boolean, T]>;
	dataStore: DataStoreInterface;
	default: T;
	key: string;
	lockSessions: boolean;
	migrations: Migrations;
}) => DocumentStore<T>;

declare const DocumentStore: DocumentStoreConstructor<unknown>;
export = DocumentStore;
