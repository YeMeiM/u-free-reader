let _input_el_: HTMLInputElement;
let focusTimer = -1;
let _resolve_: ((files: File[]) => void) | undefined;
let _reject_: ((error: unknown) => void) | undefined;

function clearFileEL() {
  clearTimeout(focusTimer)
  _reject_ = _resolve_ = undefined;
  if (_input_el_) _input_el_.value = '';
  removeEventListener('focus', onChooseFileFocus)
}

function onFileElChange() {
  if (!_resolve_) return;
  if (_input_el_.files) _resolve_(Array.from(_input_el_.files));
  else _resolve_([]);
  clearFileEL();
}

function onFileElError(e: unknown) {
  if (!_reject_) return;
  _reject_(e);
  clearFileEL();
}

function onChooseFileFocus() {
  focusTimer = window.setTimeout(function () {
    if (_reject_) _reject_(new Error('用户取消选择'));
    clearFileEL();
  }, 1000)
}

interface ChooseFileOption {
  /**
   * 是否能多选
   */
  multiple: boolean;
  /**
   * 文件类型
   */
  accept: string;
}

/**
 * 选择文件
 * @param multiple 是否多选，默认单选
 * @param accept 文件类型，默认图片
 */
export function chooseFile({multiple = true, accept = 'image/*'}: Partial<ChooseFileOption> = {}) {
  return new Promise<File[]>((resolve, reject) => {
    if (_reject_) {
      _reject_(new Error('文件选择超时'));
      clearFileEL();
      return;
    }
    if (!_input_el_) {
      _input_el_ = document.createElement('input');
      _input_el_.type = 'file'
      _input_el_.addEventListener('change', onFileElChange);
      _input_el_.addEventListener('error', onFileElError);
    }
    _input_el_.multiple = multiple;
    _input_el_.accept = accept;
    _resolve_ = resolve;
    _reject_ = reject;
    addEventListener('focus', onChooseFileFocus);
    _input_el_.click();
  })
}

/**
 * 下载文件
 * @param url 文件地址或文件 blob 对象
 * @param name 文件名，为空时使用url名称，如果为blob对象或url不存在名称，则必传
 */
export function downloadFile(url: string | Blob, name = '') {
  let dUrl: string
  if (typeof url !== 'string') {
    if (!name && url instanceof File) name = url.name;
    dUrl = URL.createObjectURL(url);
  } else {
    dUrl = url;
  }
  const tagA = document.createElement('a');
  tagA.href = dUrl;
  tagA.download = name;
  tagA.click();
  if (url !== dUrl) setTimeout(() => URL.revokeObjectURL(dUrl), 3);
}


/**
 * 返回数据流二进制数据
 * @param file
 */
export function readFile(file: Blob): Promise<ArrayBuffer>;
export function readFile(file: Blob, type: 'binaryString' | 'text' | 'base64'): Promise<string>;
/**
 * 读取文件，传入一个 blob 或 file 对象，返回读取后的数据
 * @param file 读取的文件
 * @param type 需要读取的数据类型
 */
export function readFile(file: Blob, type: 'arrayBuffer' | 'binaryString' | 'text' | 'base64' = 'arrayBuffer'): Promise<ArrayBuffer | string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (res) => {
      if (!res.target || !res.target.result) return reject(new Error('文件读取失败'));
      resolve(res.target.result);
    }
    fr.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    if (type === 'arrayBuffer') fr.readAsArrayBuffer(file);
    else if (type === 'base64') fr.readAsDataURL(file);
    else if (type === 'text') fr.readAsText(file);
    else if (type === 'binaryString') fr.readAsBinaryString(file)
  })
}