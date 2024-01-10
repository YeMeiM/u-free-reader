import './home.scss'
import {useEffect, useState} from "react";
import {getBookshelf} from "./books.tsx";
import {chooseFile} from "../../utils/fm.ts";
import {readEPUB} from "../../utils/epub.ts";

interface BookBoxProps {
  cover: string;
  name: string;
}

function BookBox(props: BookBoxProps) {
  let coverEl;
  if (props.cover) coverEl = <img src={props.cover} alt="" className="book-cover"/>
  else coverEl = <div className="book-cover empty-holder" >无封面</div>

  return (<div className="book-bok-component">
    {coverEl}
    <div className="book-name">{props.name || '未命名'}</div>
  </div>)
}

function HomeToolsBar() {

  const onAddBook = async function(){
    try{
      const files = await chooseFile({
        accept: 'application/epub+zip'
      });
      if(files.length === 0) return;
      await readEPUB(files[0]);
    }catch(e){
      console.log('e', e)
    }
  }

  return (<div className="home-tools-bar-component" >
    <div className="bar-title">书架</div>
    <div className="tools-group">
      <button className="button add-book" onClick={onAddBook} >添加</button>
    </div>
  </div>)
}

export default function HomePage(){

  const [books, setBooks] = useState<BookBoxProps[]>([])

  useEffect(() => {
    // 获取书籍列表
    getBookshelf().then(setBooks);
  }, []);

  return <div className="home-page-container" >
    <HomeToolsBar />
    <div className="bookshelf-container">
      {
        books.map((it, index) => (<BookBox key={index} cover={it.cover} name={it.name} />))
      }
    </div>
  </div>
}
