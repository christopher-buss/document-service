type SignalParameters<T> = Parameters<
	T extends Array<unknown>
		? (...args: T) => never
		: T extends unknown
			? (argument: T) => never
			: () => never
>;
type SignalCallback<T> = (...args: SignalParameters<T>) => unknown;
type SignalWait<T> = T extends Array<unknown> ? LuaTuple<T> : T;

type RBXScriptSignalType<T> =
	T extends Array<unknown>
		? RBXScriptSignal<(...args: T) => void>
		: T extends unknown
			? RBXScriptSignal<(argument: T) => void>
			: RBXScriptSignal;

declare namespace Signal {
	interface Constructor {
		/** Constructs a new Signal. */
		new <T>(): Signal<T>;

		/** Returns `true` if the given object is a Signal. */
		Is: (object: unknown) => boolean;

		/**
		 * Creates a new Signal that wraps around a native Roblox signal. The
		 * benefit of doing this is the ability to hook into Roblox signals and
		 * easily manage them in once place.
		 */
		Wrap: <T>(rbxScriptSignal: RBXScriptSignalType<T>) => Signal<T>;
	}

	export interface Connection {
		/**
		 * If `true`, the connection is still connected. This field is
		 * read-only.
		 *
		 * To disconnect a connection, call the connection's `Disconnect()`
		 * method.
		 */
		readonly Connected: boolean;

		/** Alias for `Disconnect()`. */
		Destroy(): void;

		/** Disconnect the connection. */
		Disconnect(): void;
	}
}

export interface Signal<T> {
	/**
	 * Connects a callback function to the signal. This callback function will
	 * be called any time the signal is fired.
	 */
	Connect(callback: SignalCallback<T>): Signal.Connection;

	/** Destroys the signal. This is an alias for `Disconnect()`. */
	Destroy(): void;

	/** Disconnects all connections to the signal. */
	DisconnectAll(): void;

	/** Fires the signal. */
	Fire(...args: SignalParameters<T>): void;

	/**
	 * Fires the signal using `task.defer` internally. This should only be used
	 * if `task.defer` is necessary, as the normal `Fire` method optimizes for
	 * thread reuse internally.
	 */
	FireDeferred(...args: SignalParameters<T>): void;

	/**
	 * Connects a callback function to the signal which will fire only once and
	 * then automatically disconnect itself.
	 */
	Once(callback: SignalCallback<T>): Signal.Connection;

	/**
	 * Yields the current thread until the signal fires. The arguments fired are
	 * returned.
	 */
	Wait(): SignalWait<T>;
}
