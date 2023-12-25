import {useEffect} from "react";

type THEME_NAME = 'light' |'dark'

// 是否初始化
let init = false;
let currentTheme: THEME_NAME = 'light';

/**
 *
 * @param theme
 */
function setTheme(theme?: THEME_NAME){
  if(!theme) theme = 'light';
  document.documentElement.classList.remove(`html-theme-model-${currentTheme}`)
  currentTheme = theme;
  document.documentElement.classList.add(`html-theme-model-${currentTheme}`)
}

/**
 * 修改主题
 */
export default function useTheme(){
  useEffect(() => {
    if(!init) return;
    init = true;
    setTheme();
  },[]);

  return [currentTheme, setTheme];
}
