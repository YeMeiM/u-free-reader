import type {HomeToolsBarProps} from '../../type.ts'
import {chooseFile} from "@/utils/fm.ts";
import {readEPUB} from "@/utils/epub.ts";
import {nanoid} from "nanoid";
import type {BookBoxProps} from "@/views/home/Home.type.ts";

/**
 * 书架工具栏
 * @param props
 * @returns
 */
export function HomeToolsBar({
                               onAddBookBox
                             }: HomeToolsBarProps) {

  /**
   * 添加书
   * @returns
   */
  const onAddBook = async function () {
    try {
      // 目前仅支持epub格式
      const files = await chooseFile({
        accept: 'application/epub+zip'
      });
      if (files.length === 0) return;
      // 读取epub文件信息
      const epubInfo = await readEPUB(files[0]);
      const cover = URL.createObjectURL(await epubInfo.asyncFile(epubInfo.cover, 'blob'));
      // 回调，返回书籍信息
      onAddBookBox && onAddBookBox({
        cover: cover,
        name: epubInfo.name,
        id: nanoid(),
      }, epubInfo)
    } catch (e) {
      console.log('e', e)
    }
  }

  return (<div className="home-tools-bar-component">
    <div className="bar-title">书架</div>
    <div className="tools-group">
      <button className="button add-book" onClick={onAddBook}>添加</button>
    </div>
  </div>)
}

/**
 * 书本盒子
 * @param book 书本信息
 * @param onClick 点击事件
 * @constructor
 */
export function BookBox({book, onClick}: BookBoxProps) {
  const onClickBook = function () {
    onClick && onClick(book);
  };

  let coverEl;
  if (book.cover) coverEl = <img src={book.cover} alt="" className="book-cover"/>
  else coverEl = <div className="book-cover empty-holder">无封面</div>

  return (<div className="book-bok-component" onClick={onClickBook}>
    {coverEl}
    <div className="book-name">{book.name || '未命名'}</div>
  </div>)
}
