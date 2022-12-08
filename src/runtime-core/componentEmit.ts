/*
 * @Description: 处理emit
 * @Author: Sunly
 * @Date: 2022-12-08 18:38:14
 */
import { toHandlerKey, camelize } from "../shared/index";

export function emit(instance, event, ...args) {
  const { props } = instance;
  const handler = props[toHandlerKey(camelize(event))];
  handler && handler(...args);
}
