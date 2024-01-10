
export interface BookshelfType {
  cover: string;
  name: string;
  isLocal: boolean;
  path: string;
  history?: string;
}

/**
 * 获取书架列表
 */
export async function getBookshelf(): Promise<BookshelfType[]>{
  return [];
  // if(!utools) return [];
  // const res = await utools.db.promises.get('MY_BOOkSHELF');
  // return (res && res.data) || [];
}
