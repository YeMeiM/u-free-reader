interface OpenDBResult {
  db: IDBDatabase;
  event?: Event;
  message: string;
  errorType?: string;
  errorCode?: number;
}

/**
 * 打开数据库
 * @param name 数据库名称
 * @param version 数据库版本
 * @param upgradeneeded 数据库初始化或者数据库版本更新
 */
export function openDB(name: string, version?: number, upgradeneeded?: DBUpgradeneededHandler) {
  return new Promise<OpenDBResult>((resolve, reject) => {
    if (!window.indexedDB) {
      return reject({
        event: null,
        message: '当前浏览器无法使用数据库存储，建议使用新版chrome浏览器',
        errorType: 'not-support ',
        errorCode: 402
      })
    }

    const idb = window.indexedDB.open(name, version)
    idb.onsuccess = function (event) {
      idb.onsuccess = null;
      idb.onerror = null;
      resolve({
        db: this.result,
        message: '成功',
        event,
        errorCode: 0,
        errorType: 'success'
      })
    }
    idb.onerror = function (event) {
      idb.onsuccess = null;
      idb.onerror = null;
      reject({
        event,
        message: '数据库连接失败，请授予本应用数据库连接权限',
        errorType: 'no-permission',
        errorCode: 401
      });
    }

    idb.onupgradeneeded = function (ev) {
      upgradeneeded?.(this.result, ev)
    };
  })
}

interface DBUpgradeneededHandler {
  (db: IDBDatabase, event: IDBVersionChangeEvent): void;
}

interface DBStoreInfo {
  /**
   * 是否自增
   */
  autoIncrement?: boolean;
  /**
   * 主键索引
   */
  keyPath?: string | string[] | null;

  oncomplete?: ((this: IDBTransaction, ev: Event) => unknown) | null;

  indexes?: Record<string, IDBIndexParameters & {
    keyPath?: string | string[] | null;
  }>;
}

export interface CreateDBOption {
  /**
   * 数据库名称
   */
  name: string;
  /**
   * 数据库版本
   */
  version?: number;
  /**
   * 储存库描述
   */
  stores?: Record<string, DBStoreInfo>
}

/**
 * dbRequest对象转为promise格式处理
 * @param request
 */
export function dbRequestPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = function () {
      resolve(this.result)
    }
    request.onerror = reject;
  })
}

/**
 * 创建db连接
 */
export async function createSimpleDB({name, version, stores}: CreateDBOption) {
  const {db} = await openDB(name, version, function (db) {
    if (!stores) return;
    for (const storeK in stores) {
      if (db.objectStoreNames.contains(storeK)) continue;
      if (!stores[storeK]) {
        db.createObjectStore(storeK);
        continue
      }
      const {
        keyPath,
        autoIncrement,
        indexes,
        oncomplete
      } = stores[storeK];
      const store = db.createObjectStore(storeK, {keyPath, autoIncrement})
      if (!indexes) continue;
      for (const k in indexes) {
        store.createIndex(k, indexes[k].keyPath || k, indexes[k]);
      }
      store.transaction.oncomplete = oncomplete || null;
    }
  });

  /**
   * 关闭数据库
   */
  const closeDb = function () {
    db.close();
  }

  /**
   * 删除数据库
   */
  const deleteDB = function () {
    indexedDB.deleteDatabase(name);
  }

  /**
   * 使用事务，包装函数，尽量不直接使用db对象
   * @param storeNames 储存库名字
   * @param mode 模式
   * @param options 参数
   */
  const transaction: typeof db.transaction = function (
      storeNames,
      mode,
      options) {
    return db.transaction(storeNames, mode, options);
  }

  /**
   * 获取储存的数据
   * @param storeName 储存库名字
   * @param key 储存库值的索引
   */
  const get = function <T>(storeName: string, key: IDBValidKey) {
    const store = db.transaction(storeName).objectStore(storeName);
    return dbRequestPromise<T>(store.get(key))
  }

  /**
   * 添加数据
   * @param storeName 储存库名称
   * @param data 添加的数据
   * @param key 储存数据对应的key
   */
  const add = function <T>(storeName: string, data: T, key?: IDBValidKey) {
    const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
    return dbRequestPromise(store.add(data, key))
  }

  /**
   * 更新数据
   * @param storeName 储存库名称
   * @param data 要更新的数据
   * @param key 更新数据对应的key
   */
  const update = function <T>(storeName: string, data: T, key?: IDBValidKey) {
    return dbRequestPromise(db.transaction([storeName], 'readwrite')
        .objectStore(storeName).put(data, key))
  }

  /**
   * 删除数据
   * @param storeName 储存库名称
   * @param key 删除的储存库对应key
   */
  const remove = function (storeName: string, key: IDBValidKey | IDBKeyRange) {
    return dbRequestPromise(db.transaction([storeName], 'readwrite')
        .objectStore(storeName).delete(key))
  }

  /**
   * 遍历存储库
   * @param storeName 存储库名称
   * @param callback 回调函数，每一次遍历的结果会传入回调函数中
   * @param onerror 遍历失败，可以不传，一般不会失败
   */
  const forEach = function (
      storeName: string,
      callback: ((result: IDBCursorWithValue | null) => unknown) | null = null,
      onerror: ((...args: unknown[]) => unknown) | null = null) {
    if (!callback) return;
    const req =
        db.transaction(storeName).objectStore(storeName).openCursor()

    req.onsuccess = function () {
      callback(this.result)
    }

    req.onerror = onerror;
  }

  return {
    db,
    closeDb,
    deleteDB,
    get,
    add,
    update,
    remove,
    forEach,
    transaction,
    dbPromise: dbRequestPromise,
  }
}
