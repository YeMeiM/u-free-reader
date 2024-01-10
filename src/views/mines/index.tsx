import {
  JSX,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  MutableRefObject,
  useEffect,
  useReducer,
  useRef,
  useState
} from "react";
import './index.scss'

type MineType = {
  /**
   * 列
   */
  x: number,
  /**
   * 行
   */
  y: number,
  /**
   * 坐标标识
   */
  id: string,
  /**
   * 是否是雷
   */
  isMine: boolean,
  /**
   * 有没有插旗
   */
  hasFlag: boolean,
  /**
   * 是否已翻开
   */
  isOpen: boolean,
  /**
   * 周围有几个地雷
   */
  count: number
}

type MineItemProps = {
  info: MineType;
  /**
   * 打开
   * @param info
   * @param e
   */
  onClick?(info: MineType, e: ReactMouseEvent): void;

  onContext?(info: MineType, e: ReactMouseEvent): void;
}

function createMine(x = -1, y = -1): MineType {
  return {
    x,
    y,
    id: `${x}-${y}`,
    isMine: false,
    hasFlag: false,
    isOpen: false,
    count: 0,
  }
}

function TimerBox({timeRef}: { timeRef?: MutableRefObject<number> }) {
  const [time, setTime] = useState(0);
  const setTimeRef = useRef<(() => void) | null>(null);
  const text = useRef('00:00')
  setTimeRef.current = () => {
    const cTime = time + 1;
    setTime(cTime);
    const {m, s} = formatTime(cTime)
    text.current = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    timeRef && (timeRef.current = cTime)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRef.current!();
    }, 1000)

    return () => clearInterval(timer);
  }, []);
  return <span>{text.current}</span>
}

function initMines(row: number, col: number) {
  const list: MineType[][] = [];
  for (let i = 0; i < row; i++) {
    const row = [];
    for (let j = 0; j < col; j++) row.push(createMine(j, i));
    list.push(row)
  }
  return list;
}

function minesReducer(state: MineType[][], {type, value}: {
  type: 'update',
  value: MineType,
} | {
  type: 'init',
  value: number | [number, number]
} | {
  type: 'set',
  value: typeof state,
}) {
  if (type === 'update' && state[value.y] && state[value.y][value.x]) {
    Object.assign(state[value.y][value.x], value);
    return Array.from(state);
  }
  if (type === 'init') {
    if (typeof value === 'number') return initMines(value, value);
    return initMines(...value);
  }
  if (type === 'set') return value;
  return state;
}

function useMines() {
  return useReducer(minesReducer, [])
}

function MinesItem({info, onClick, onContext}: MineItemProps) {
  let child: JSX.Element | null = null;
  let clickItem: MouseEventHandler | undefined = undefined;
  if (onClick) clickItem = (e) => onClick(info, e);
  let contextItem: MouseEventHandler | undefined = undefined;
  if (!info.isOpen) {
    if (onContext) contextItem = (e) => onContext(info, e);
    if (info.hasFlag) child = <span className="item-cover item-flag">⚑</span>;
  } else {
    if (!info.isMine) child = <span className="item-cover item-open item-count">{info.count || ''}</span>
    else child = <span className="item-cover item-open item-mine">☼</span>
  }
  return (<div className="mines-item" onContextMenu={contextItem} onClick={clickItem}>{child}</div>)
}

function getP(max = 8) {
  return Math.floor(Math.random() * max)
}

function eachItemAround(
    mines: MineType[][],
    item: MineType,
    handler: (item: MineType, index: number) => void
) {
  let x = 0, y = 0, count = 0;
  for (let i = -1; i <= 1; i++) {
    y = item.y + i;
    for (let j = -1; j <= 1; j++) {
      x = item.x + j;
      if (i === 0 && j === 0) continue;
      if (mines[y] && mines[y][x]) handler(mines[y][x], count++);
    }
  }
}

function formatTime(time: number) {
  return {
    m: Math.floor(time / 60),
    s: time % 60,
  }
}


function fillMines(mines: MineType[][], item: MineType) {
  let count = Math.floor(mines.length * mines[0].length * 0.2);
  let x: number, y: number;
  while (count > 0) {
    x = getP(mines[0].length);
    y = getP(mines.length);
    // 如果和点击的坐标一样，跳过
    if (x === item.x && y === item.y) continue;
    // 已经是地雷了，跳过
    if (mines[y][x].isMine) continue;
    mines[y][x].isMine = true;
    // 遍历地雷周围，给地雷周围的格子添加一个数
    eachItemAround(mines, mines[y][x], it => it.count++);
    count--;
  }
  return Array.from(mines);
}

function isAllClear(mines: MineType[][]) {
  return mines.every(row => row.every(it => it.isMine || it.isOpen))
}

function autoOpen(mines: MineType[][], item: MineType, handler?: (it: MineType) => void) {
  if (item.count !== 0) return mines;
  if (!handler) handler = (it) => {
    if (it.isOpen || it.isMine) return;
    it.isOpen = true;
    if (it.count > 0) return;
    autoOpen(mines, it, handler);
  }
  eachItemAround(mines, item, handler)
  return mines;
}

const GAME_LEVEL = [4, 8, 12, 16, 20, 32];

export default function MinesPage() {
  const [level, setLevel] = useState(-1);
  const [mines, dispatch] = useMines()
  // -1 未开始，0一开始，1已结束
  const [gameStatus, setGameStatus] = useState(-1);
  const gameTime = useRef(0);
  const [gameRecord, setGameRecord] = useState('');

  const gameOver = function (success = false) {
    setGameStatus(1)
    setTimeout(() => {
      if (success) {
        const {m, s} = formatTime(gameTime.current);
        if (!m) alert(`过关了！耗时${s}秒`);
        else alert(`过关了！耗时${m}分${s}秒`);
        const oldRecord = localStorage.getItem(`USER_LEVEL_RECORD_${level}`);
        if(!oldRecord || gameTime.current < Number(oldRecord)) {
          localStorage.setItem(`USER_LEVEL_RECORD_${level}`, gameTime.current.toString());
          setGameRecord(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
        }
        if (!oldRecord && level < GAME_LEVEL.length - 1) setLevel(level + 1);
      } else alert('游戏结束');
      dispatch({type: 'init', value: GAME_LEVEL[level]})
      setGameStatus(-1)
    }, 0)
  }

  const resetLevel = function (l: number) {
    // 没通关，不能进行下一关
    if (l > 0 && !localStorage.getItem(`USER_LEVEL_RECORD_${level}`)) return;
    l += level;
    if (l < 0 || l >= GAME_LEVEL.length) return;
    setLevel(l);
  }

  const itemOnClick: MineItemProps['onClick'] = function (item, e): void {
    // 已结束或者是打开的
    if (gameStatus === 1 || item.isOpen) {
      if (e.altKey) {
        item.isOpen = false;
        dispatch({type: 'update', value: item})
      }
      return
    }
    // 按着ctrl，插旗
    if (e.ctrlKey) {
      item.hasFlag = !item.hasFlag;
      dispatch({type: 'update', value: item})
      return;
    }
    if (item.hasFlag) return;
    // 设置为打开
    item.isOpen = true;
    // 还没有设置地雷，初始化设置地雷
    if (gameStatus === -1) {
      setGameStatus(0);
      const fileList = fillMines(mines, item);
      // 自动打开
      dispatch({type: 'set', value: autoOpen(fileList, item)});
      return;
    }
    if (!e.altKey && item.isMine) {
      dispatch({type: 'update', value: item})
      gameOver();
      return;
    }

    dispatch({type: 'set', value: autoOpen(Array.from(autoOpen(mines, item)), item)});
    if (isAllClear(mines)) return gameOver(true);
  }

  const itemOnContext: MineItemProps['onContext'] = function (item, e) {
    // 已结束或者是打开的
    if (gameStatus === 1 || item.isOpen) return;
    item.hasFlag = !item.hasFlag;
    dispatch({type: 'update', value: item});
    e.preventDefault();
  }

  const minesRows = mines.map((row, rI) => {
    return (<div className="mines-row" key={rI}>
      {
        row.map(item => (<div className="mines-col" key={item.id}>
          <MinesItem info={item} onClick={itemOnClick} onContext={itemOnContext}/>
        </div>))
      }
    </div>)
  })

  useEffect(() => {
    const localLevel = Number(localStorage.getItem('GAME_LEVEL'));
    if (localLevel >= 0) setLevel(localLevel);
    else setLevel(0)
  }, []);

  useEffect(() => {
    if (level === -1) return;
    setGameStatus(-1);
    localStorage.setItem('GAME_LEVEL', (level).toString());
    dispatch({type: 'init', value: GAME_LEVEL[level]})
    const localRecord = localStorage.getItem(`USER_LEVEL_RECORD_${level}`);
    if (!localRecord) setGameRecord('');
    else {
      const {m, s} = formatTime(Number(localRecord));
      setGameRecord(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }
  }, [dispatch, level]);

  return <div className="mines-page">
    <div className="header-bar">
      <div className="timer-box">
        {gameStatus >= 0 ? <TimerBox timeRef={gameTime}/> : <span>00:00</span>}
      </div>
      <div className="level-text">等级：
        <span className="weight">{level + 1}</span>
      </div>
      <button className="button prev" onClick={() => resetLevel(-1)}>↑</button>
      <button className="button next" onClick={() => resetLevel(1)}>↓</button>
      <div className="record-text">历史记录：
        <span>{gameRecord || '暂无'}</span>
      </div>
    </div>
    <div className="body-container">
      <div className="board">{minesRows}</div>
    </div>
  </div>
}
