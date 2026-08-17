import {useReducer} from "react";

export function createTuple<T1, T2>(t1: T1, t2: T2): [T1, T2];
export function createTuple<T1, T2, T3>(t1: T1, t2: T2, t3?: T3): [T1, T2] | [T1, T2, T3]{
  if(t3 === undefined) return [t1, t2];
  return [t1, t2, t3];
}

enum ListStateActionType {
  UPDATE_INDEX = 'UPDATE_INDEX',
  UPDATE_LIST = 'UPDATE_LISt'
}

function listStateReducer<T = any>(state: T[], action: {
  type: ListStateActionType.UPDATE_INDEX,
  index: number,
  value?: T,
} | {
  type: ListStateActionType.UPDATE_LIST,
  value: T[]
}): T[]{
  if(action.type === ListStateActionType.UPDATE_LIST) return action.value;
  if(!action.value) state.splice(action.index, 1);
  else state[action.index] = action.value;
  return state;
}

export type SetListMethod<T> = {
  /**
   * 设置列表中的一项数据
   * @param index 在列表中的索引
   * @param value 要更新的值
   */
  (index: number, value?: T): void;
  /**
   * 设置整个列表的数据
   * @param list 更新的列表
   */
  (list: T[]): void;
}

export function useListState<T = any>(list: T[]){
  const [state, dispatch] = useReducer(listStateReducer<T>, list)
  const setList: SetListMethod<T> = function(index: number| T[], value?:T ){
    if(typeof index === 'number'){
      dispatch({type: ListStateActionType.UPDATE_INDEX, index, value});
    } else {
      dispatch({ type: ListStateActionType.UPDATE_LIST, value: index })
    }
  }
  return createTuple(state, setList);
}
