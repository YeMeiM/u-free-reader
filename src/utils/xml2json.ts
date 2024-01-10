let domParser: DOMParser | null = null;

export type XmlJsonData = {
  name: string;
  text: string;
  attrs: Record<string, string>;
  children: Array<XmlJsonData>
}

function getDataFromElement(el: Element){
  const json: XmlJsonData = {
    name: el.tagName,
    text: '',
    attrs: {},
    children: [],
  };
  for(const attr of el.attributes) json.attrs[attr.name] = attr.value;
  for(const node of el.childNodes)
    node.nodeType === 3 && (json.text = `${json.text}${node.nodeValue?.trim()}`);
  if(el.children.length)
    for(const c of el.children) json.children.push(getDataFromElement(c))
  return json;
}

/**
 * 解析xml字符串，转为document文档
 * @param xml
 * @param type
 */
export function readXML(xml: string, type: DOMParserSupportedType = 'application/xml') {
  if (!domParser) domParser = new DOMParser();
  return domParser.parseFromString(xml, type)
}

/**
 * 解析XML，返回xml对应json数据
 * @param xml 字符串、xml dom、xml 文旦
 * @param type
 */
export function parseXML(xml: string | Element | Document, type: DOMParserSupportedType = 'application/xml'){
  if(typeof xml === 'string') xml = readXML(xml, type);
  if(xml instanceof Document) xml = xml.documentElement;
  return getDataFromElement(xml);
}

export function toJson(xmlData: XmlJsonData){
  const jsonData: any = {};
  if(xmlData.children.length === 0){
    jsonData[xmlData.name] = xmlData.text;
  }
}
