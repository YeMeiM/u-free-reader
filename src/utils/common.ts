import * as wasmUtils from './wasm_utils/wasm_utils'

/**
 * 深度克隆，如果是复杂对象则可能无法正确克隆
 * @param origin
 */
export function deepClone<T = unknown>(origin: T): T {
  if (!origin || typeof origin !== 'object') return origin;
  if (Array.isArray(origin)) return origin.map(it => deepClone(it)) as T;
  if (origin instanceof Date) return new Date(origin) as T;
  if(origin instanceof FormData) {
    const formData = new FormData()
    origin.forEach((value, key) => formData.set(key, value));
    return formData as T;
  }
  const result = Object.assign({}, origin);
  for (const k in result) result[k] = deepClone(origin[k]);
  return result;
}

/**
 * 获取wasm工具
 */
export function wu() {
  return wasmUtils;
}