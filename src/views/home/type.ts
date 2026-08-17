import type {EPUBInfo} from "@/utils/epub.ts";

/**
 * 书籍盒子
 */
export type BookBoxProps = {
  /**
   * 书籍信息
   */
  book: BookBasicInfo;
  /**
   * 点击书籍
   * @param book 书籍信息
   */
  onClick?(book: BookBasicInfo): void;
}

/**
 * 书籍基础信息
 */
export type BookBasicInfo = {
  /**
   * 封面
   */
  cover: string;
  /**
   * 书名
   */
  name: string;
  /**
   * 唯一id
   */
  id: string;
  /**
   * 阅读历史，为空暂未阅读
   */
  history?: string;
}

/**
 * 首页顶部工具栏组件参数
 */
export type HomeToolsBarProps = {
  /**
   * 需要添加书本的回调
   * @param book 书本信息
   * @param epubInfo 书本文件信息
   * @returns
   */
  onAddBookBox?: (book: BookBasicInfo, epubInfo: EPUBInfo) => void;
}