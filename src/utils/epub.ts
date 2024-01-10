import jszip from 'jszip'
import {parseXML, readXML, XmlJsonData} from "./xml2json.ts";

export interface BookNavItem {
  title: string,
  index: string,
  content: string,
  file: string,
  position: string
}

interface OutputByType {
  base64: string;
  string: string;
  text: string;
  binarystring: string;
  array: number[];
  uint8array: Uint8Array;
  arraybuffer: ArrayBuffer;
  blob: Blob;
}

/**
 * 读取函数
 */
export interface AsyncFileFunction {
  <T extends keyof OutputByType>(type: T, onUpdate?: jszip.OnUpdateCallback): Promise<OutputByType[T]>
}

export interface EPUBInfo {
  /**
   * 书籍唯一标识
   */
  identifier: string;
  /**
   * 书名
   */
  name: string;
  /**
   * 封面
   */
  cover: string;
  /**
   * 创建日期
   */
  date?: string;
  /**
   * 作者
   */
  author?: string;
  /**
   * 书籍语言
   */
  language?: string;
  /**
   * 书籍描述
   */
  description?: string;
  /**
   * 目录列表，如果未定义，需要调用 getNavList
   */
  navList?: BookNavItem[];
  /**
   * 获取目录列表
   */
  getNavList: () => Promise<BookNavItem[]>;

  /**
   * 获取对应文件
   * @param path 文件路径
   * @param type 选择返回类型
   * @param onUpdate 当文件更新时执行
   */
  asyncFile<T extends keyof OutputByType>(
      path: string, type: T, onUpdate?: jszip.OnUpdateCallback
  ): Promise<OutputByType[T]>

  [prop: string]: any;
}

/**
 * metadata映射
 */
const META_DATA_MAP: Record<string, keyof EPUBInfo> = {
  'dc:identifier': 'identifier',
  'dc:creator': 'author',
  'dc:title': 'name',
  'dc:language': 'language',
  'dc:publisher': 'publisher',
  'dc:date': 'date',
  'dc:description': 'description',
}

/**
 * 填充metadata数据
 * @param info
 * @param meta
 * @param identifier
 */
function fillMetaData(info: Partial<EPUBInfo>, meta: XmlJsonData, identifier: string) {
  for (const item of meta.children) {
    if (item.name === 'meta' && item.attrs.name === 'cover') info.cover = item.attrs.content;
    else if (META_DATA_MAP[item.name]) {
      if (item.name !== 'dc:identifier' || item.attrs.id !== identifier) continue
      info[META_DATA_MAP[item.name]] = item.text;
    }
  }
}

function initNavList(ncxXml: Document, dirPath: string) {
  const domList = ncxXml.getElementsByTagName('navPoint')
  const navList = [];
  for (const dom of domList) {
    const res: BookNavItem = {
      title: '',
      index: dom.getAttribute('playOrder')!,
      content: '',
      file: '',
      position: '',
    }

    for (const c of dom.children) {
      if (c.tagName === 'navLabel') res.title = c.textContent!.trim();
      else if (c.tagName === 'content') res.content = c.getAttribute('src')!;
    }
    res.content = dirPath + res.content;
    const content = res.content.split('#');
    res.file = content[0];
    res.position = content[1] || '';
    navList.push(res)
  }
  return navList;
}

export async function readEPUB(file: File) {
  const epubInfo: Partial<EPUBInfo> = {};
  const zipRes = await jszip.loadAsync(file);
  // console.log('dirs', zipRes.files)

  // 内容固定，不需要读取
  // const mimetype = await zipRes.files['mimetype'].async('string');
  // console.log('mimeType', mimetype)

  // opf文件路径
  const opfPath = readXML(await zipRes.files['META-INF/container.xml']
      .async('string'))
      .getElementsByTagName('rootfile')[0]
      .getAttribute('full-path')!;
  // opfXML文档对象
  const opfXml = readXML(await zipRes.file(opfPath)!.async('string'));
  // opf文档中metadata标签json数据
  const metaData = parseXML(opfXml.getElementsByTagName('metadata')[0]);
  // 填充metadata数据
  fillMetaData(epubInfo, metaData, opfXml.documentElement.getAttribute('unique-identifier')!);
  // 当前文件目录相对路径
  const dirPath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
  // 如果有识别到的封面id
  if (epubInfo.cover) {
    // 获取封面路劲
    const coverHref = opfXml.getElementById(epubInfo.cover)!.getAttribute('href') || '';
    // 相对路径，拼接当前文件目录路径
    epubInfo.cover = dirPath + coverHref;
  }

  epubInfo.getNavList = async function () {
    if (epubInfo.navList) return epubInfo.navList;
    // ncx文档
    const ncxXml = readXML(
        await zipRes.files[dirPath + opfXml.getElementById('ncx')!
            .getAttribute('href')].async('string'));
    epubInfo.navList = initNavList(ncxXml, dirPath);
    return epubInfo.navList;
  };

  epubInfo.asyncFile = function (path, type, onUpdate) {
    return zipRes.file(path)!.async(type, onUpdate);
  }
  // console.log('EPUB info -> ', epubInfo)

  return epubInfo as EPUBInfo;
}
