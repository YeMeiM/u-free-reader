type EmptyObject = Record<string, never>;
export declare type _Method = (...args: any[]) => any;
type _DeepPartial<T> = {
  [K in keyof T]?: _DeepPartial<T[K]>;
};

type StateTree = Record<string | number | symbol, any>
type _GettersTree<S extends StateTree> = Record<string, (state: S) => any>;
export type _StoreWithGetters<G> = {
  readonly [k in keyof G]: G[k] extends (...args: any[]) => infer R ? R : G[k];
};

interface WatchOptions<Immediate = boolean> {
  immediate?: Immediate;
  deep?: boolean | number;
  once?: boolean;
}
/**
 * Store type to build a store.
 */
export declare type Store<Id extends string = string, S extends StateTree = EmptyObject, G = EmptyObject, A = EmptyObject> = _StoreWithState<Id, S, G, A> & S & _StoreWithGetters<G> & (_ActionsTree extends A ? EmptyObject : A);


/**
 * Generic and type-unsafe version of Store. Doesn't fail on access with
 * strings, making it much easier to write generic functions that do not care
 * about the kind of store that is passed.
 */
export declare type StoreGeneric = Store<string, StateTree, _GettersTree<StateTree>, _ActionsTree>;

/**
 * Type of an object of Actions. For internal usage only.
 * For internal use **only**
 */
export declare type _ActionsTree = Record<string, _Method>;

export declare type _Awaited<T> = T extends null | undefined ? T : T extends object & {
  then(onfulfilled: infer F): any;
} ? F extends (value: infer V, ...args: any) => any ? _Awaited<V> : never : T;

/**
 * Argument of `store.$onAction()`
 */
export declare type StoreOnActionListener<Id extends string, S extends StateTree, G, A> = (context: StoreOnActionListenerContext<Id, S, G, EmptyObject extends A ? _ActionsTree : A>) => void;

/**
 * Context object passed to callbacks of `store.$onAction(context => {})`
 * TODO: should have only the Id, the Store and Actions to generate the proper object
 */
export declare type StoreOnActionListenerContext<Id extends string, S extends StateTree, G, A> = _ActionsTree extends A ? _StoreOnActionListenerContext<StoreGeneric, string, _ActionsTree> : {
  [Name in keyof A]: Name extends string ? _StoreOnActionListenerContext<Store<Id, S, G, A>, Name, A> : never;
}[keyof A];

/**
 * Actual type for {@link StoreOnActionListenerContext}. Exists for refactoring
 * purposes. For internal use only.
 * For internal use **only**
 */
export declare interface _StoreOnActionListenerContext<Store, ActionName extends string, A> {
  /**
   * Name of the action
   */
  name: ActionName;
  /**
   * Store that is invoking the action
   */
  store: Store;
  /**
   * Parameters passed to the action
   */
  args: A extends Record<ActionName, _Method> ? Parameters<A[ActionName]> : unknown[];
  /**
   * Sets up a hook once the action is finished. It receives the return value
   * of the action, if it's a Promise, it will be unwrapped.
   */
  after: (callback: A extends Record<ActionName, _Method> ? (resolvedReturn: _Awaited<ReturnType<A[ActionName]>>) => void : () => void) => void;
  /**
   * Sets up a hook if the action fails. Return `false` to catch the error and
   * stop it from propagating.
   */
  onError: (callback: (error: unknown) => void) => void;
}

export declare interface StoreProperties<Id extends string> {
  $id: Id;
}
type SubscriptionCallback<S> = (
  /**
   * Object with information relative to the store mutation that triggered the
   * subscription.
   */
  mutation: any,
  /**
   * State of the store when the subscription is triggered. Same as
   * `store.$state`.
   */
  state: S) => void;

export interface _StoreWithState<Id extends string, S extends StateTree, G, A> extends StoreProperties<Id> {
  /**
   * State of the Store. Setting it will internally call `$patch()` to update the state.
   */
  $state: S;
  /**
   * Applies a state patch to current state. Allows passing nested values
   *
   * @param partialState - patch to apply to the state
   */
  $patch(partialState: _DeepPartial<S>): void;
  /**
   * Group multiple changes into one function. Useful when mutating objects like
   * Sets or arrays and applying an object patch isn't practical, e.g. appending
   * to an array. The function passed to `$patch()` **must be synchronous**.
   *
   * @param stateMutator - function that mutates `state`, cannot be asynchronous
   */
  $patch<F extends (state: S) => any>(stateMutator: ReturnType<F> extends Promise<any> ? never : F): void;
  /**
   * Resets the store to its initial state by building a new state object.
   */
  $reset(): void;
  /**
   * Setups a callback to be called whenever the state changes. It also returns a function to remove the callback. Note
   * that when calling `store.$subscribe()` inside of a component, it will be automatically cleaned up when the
   * component gets unmounted unless `detached` is set to true.
   *
   * @param callback - callback passed to the watcher
   * @param options - `watch` options + `detached` to detach the subscription from the context (usually a component)
   * this is called from. Note that the `flush` option does not affect calls to `store.$patch()`.
   * @returns function that removes the watcher
   */
  $subscribe(callback: SubscriptionCallback<S>, options?: {
    detached?: boolean;
  } & WatchOptions): () => void;
  $onAction(callback: StoreOnActionListener<Id, S, G, A>, detached?: boolean): () => void;
  /**
   * Stops the associated effect scope of the store and remove it from the store
   * registry. Plugins can override this method to cleanup any added effects.
   * e.g. devtools plugin stops displaying disposed stores from devtools.
   * Note this doesn't delete the state of the store, you have to do it manually with
   * `delete pinia.state.value[store.$id]` if you want to. If you don't and the
   * store is used again, it will reuse the previous state.
   */
  $dispose(): void;
  /* Excluded from this release type: _r */
}


export interface DefineStoreOptions<Id extends string, S extends StateTree, G, A> {
  /**
   * 唯一id
   */
  id: Id;
  /**
   * 使用函数创建一个状态存储器
   */
  state?: () => S;
  /**
   * 只读属性
   */
  getters?: G & ThisType<S & _StoreWithGetters<G>> & _GettersTree<S>;
  /**
   * 可调用的函数
   */
  actions?: A & ThisType<A &S & _StoreWithState<Id, S, G, A> & _StoreWithGetters<G>>;
  /**
   *
   * @param storeState - 当前状态
   * @param initialState - 初始化状态
   */
  hydrate?(storeState: S, initialState: S): void;
}

const globalState: Record<string, any> = {};

export function defineStore<
  Id extends string = string, S extends StateTree = EmptyObject, G extends _GettersTree<S> = EmptyObject, A = EmptyObject>(id: Id, opt: Omit<DefineStoreOptions<Id, S, G, A>, 'id'>) {
  globalState[id] = {
    state: opt.state ? opt.state() : {},
    getters: opt.getters,

  }

  return function () {

  }
}