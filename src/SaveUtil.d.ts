import type { DataStoreInterface } from "Types";

interface SaveUtil {
	/**
	 * Errors if the data passes is not storable in JSON.
	 *
	 * Rejects:
	 *
	 * - Nan (all numbers must equal themselves).
	 * - Mixed table index types.
	 * - Non-sequential tables indexed by numbers.
	 * - Non-string or number table indexes.
	 * - Cyclic tables.
	 * - Type(value) == "userdata".
	 * - Functions.
	 * - Metatables.
	 * - Threads.
	 * - Vectors.
	 *
	 * @param data
	 * @param fieldName
	 */
	assertStorable: (data: unknown, fieldName?: string) => void;

	/**
	 * A wrapper for GetAsync that retries with exponential backoff. Prevents
	 * use of the throttle 'queue'.
	 *
	 * @param dataStore - The DataStore to get the key from.
	 * @param key- - The key to get.
	 * @yields
	 * @returns Whether the key was successfully retrieved, the data, and the
	 *   key info.
	 */
	getAsync: <T>(
		dataStore: DataStoreInterface,
		key: string,
	) => LuaTuple<[success: boolean, resultData: T | undefined, resultKeyInfo: DataStoreKeyInfo]>;

	/** @returns The budget for GetAsync. */
	getGetBudget: () => number;

	/** @returns The budget for SetAsync. */
	getSetBudget: () => number;

	/** @returns The budget for UpdateAsync. */
	getUpdateBudget: () => number;

	/**
	 * A wrapper for RemoveAsync.
	 *
	 * @param dataStore - The DataStore to remove the key from.
	 * @param key - The key to remove.
	 * @yields
	 * @returns Whether the key was successfully removed.
	 */
	removeAsync: (dataStore: DataStoreInterface, key: string) => boolean;

	/**
	 * A wrapper for UpdateAsync that retries with exponential backoff. Prevents
	 * use of the throttle 'queue', and allows retries to be aborted.
	 *
	 * @param transform - A function to transform the data.
	 * @param dataStore - The DataStore to update the key in.
	 * @param key - The key to update.
	 * @yields
	 * @returns Whether the key was successfully updated, the updated data, and
	 *   the key info.
	 */
	updateAsync: <T>(
		transform: (
			abortAttempt: (err: string) => void,
			oldValue: unknown,
			keyInfo: DataStoreKeyInfo | undefined,
		) => LuaTuple<[updatedValue: T | undefined, userIds?: Array<number>, metadata?: object]>,
		dataStore: DataStoreInterface,
		key: string,
	) => LuaTuple<[success: boolean, updatedValue: T | undefined, keyInfo: DataStoreKeyInfo]>;

	/**
	 * Luau `uuid` implementation.
	 *
	 * @see https://gist.github.com/jrus/3197011
	 */
	uuid: () => string;
}

declare const SaveUtil: SaveUtil;
export = SaveUtil;
