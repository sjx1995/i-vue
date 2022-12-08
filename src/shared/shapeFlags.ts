/*
 * @Description: shapeFlags
 * @Author: Sunly
 * @Date: 2022-12-08 15:50:00
 */
export const enum ShapeFlags {
  ELEMENT = 1,
  STATEFUL_COMPONENT = 1 << 1,
  TEXT_CHILDREN = 1 << 2,
  ARRAY_CHILDREN = 1 << 3,
}
