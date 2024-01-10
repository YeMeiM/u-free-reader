interface UToolsDBDataBase {
  _id: string;
  _rev: string;
}

type UToolsDBData<T = string> = UToolsDBDataBase & {
  /**
   * 数据
   */
  data: T;
}

type UToolsDBRes = UToolsDBDataBase & {
  /**
   * 操作是否成功
   */
  ok: boolean
}

interface UToolsDB {

  /**
   * 执行该方法将会创建或更新数据库文档，文档内容不超过 1M
   * 异步方式：utools.db.promises.put(doc)
   * @param doc 参数对象
   */
  put: (doc: UToolsDBData) => UToolsDBRes;

  /**
   * 根据文档 ID 获取数据
   * 异步方式：utools.db.promises.get(id)
   * @param id
   */
  get: (id: string) => UToolsDBData | null;

  /**
   * 删除数据库文档，可以传入文档对象或文档 id 进行操作。
   * 异步方式：utools.db.promises.remove(doc)
   * @param doc 文档id，或文档对象
   */
  remove: (doc: string | UToolsDBData) => UToolsDBRes;

  /**
   * 批量更新数据库文档，传入需要更改的文档对象合并成数组进行批量更新。
   * @param docs
   */
  bulkDocs: (docs: UToolsDBData[]) => UToolsDBRes[];

  /**
   * 获取所有数据库文档，如果传入字符串，则会返回以字符串开头的文档，也可以传入指定 ID 的数组，不传入则为获取所有文档。
   * @param id id开头或id数组，不传查询全部
   */
  allDocs: (id?: string | string[]) => UToolsDBData[];

  /**
   * 存储附件到新文档，只能新建存储附件不能用于更新，附件最大不超过 10M
   * @param docId 文档id
   * @param attachment 附件，最大 10M
   * @param type 附件类型，比如：image/png, text/plain
   */
  postAttachment: (docId: string, attachment: Uint8Array, type: string) => UToolsDBRes;

  /**
   * 获取附件
   * @param docId 文档 ID
   */
  getAttachment: (docId: string) => Uint8Array;

  /**
   * 获取附件类型
   * @param docId 文档 ID
   */
  getAttachmentType: (docId: string) => string;

  /**
   * 云端复制数据状态 (null: 未开启数据同步、0: 已完成复制、1：复制中)
   */
  replicateStateFromCloud: () => null | 0 | 1;
}

type PromiseFunctionResponse<T extends Record<string, ((...args: unknown) => unknown)>> = {
  [P in keyof T]: (...args: Parameters<T[P]>) => Promise<ReturnType<T[P]>>
}

interface UToolsUtil {
  /**
   * 数据库工具
   * @see { @link https://u.tools/docs/developer/db.html } 参考网站
   */
  db: UToolsDB & {
    /**
     * 数据库工具异步版本，除返回结果为Promise对象外，其他与同步版本一致
     */
    promises: PromiseFunctionResponse<UToolsDB>
  },
}

declare global {
  const utools: UToolsUtil;
}

export {}
