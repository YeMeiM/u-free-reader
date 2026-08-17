import {HomeToolsBar, BookBox} from './components/ui/layout_ui.tsx'
import './home.scss'
import {useEffect, useRef, useState} from "react";
import {getBookshelf} from "./books.tsx";
import {EPUBInfo} from "@/utils/epub.ts";
import type {BookBasicInfo, BookBoxProps, HomeToolsBarProps} from "@/views/home/Home.type.ts";

/**
 * 首页
 * @returns
 */
export default function HomePage() {

  const [books, setBooks] = useState<BookBasicInfo[]>([]);
  const {current: bookFiles} = useRef<Record<string, EPUBInfo>>({});

  useEffect(() => {
    // 获取书籍列表
    getBookshelf().then(setBooks);
  }, []);

  /**
   * 将书籍信息添加到列表中
   * @param book
   * @param epubInfo
   */
  const onAddBookBox: HomeToolsBarProps['onAddBookBox'] = function (book, epubInfo) {
    // console.log('book', book)
    bookFiles[book.id] = epubInfo;
    setBooks([...books, book]);
  }

  /**
   * 点击书籍时
   * @param book
   */
  const onClickBook: BookBoxProps['onClick'] = async function (book) {
    const bookFile = bookFiles[book.id];
    const list = await bookFile.getNavList();
    console.log(book.name, list)
  }

  return <div className="home-page-container">
    <HomeToolsBar onAddBookBox={onAddBookBox}/>
    <div className="bookshelf-container">
      {
        books.map(it => (<BookBox key={it.id} book={it} onClick={onClickBook}/>))
      }
    </div>
  </div>
}
