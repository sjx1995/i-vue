/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-10-15 19:48:53
 */
import { isReactive, reactive, readonly } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const reactivity = reactive(original);
    // 响应式对象和原对象不同，但是可以获取到reactive.foo
    expect(original).not.toBe(reactivity);
    expect(reactivity.foo).toBe(1);
  });

  it("判断是不是reactive", () => {
    const original = { foo: 1 };
    const reactiveObj = reactive(original);
    const readonlyObj = readonly(original);
    expect(isReactive(original)).toBe(false);
    expect(isReactive(reactiveObj)).toBe(true);
    expect(isReactive(readonlyObj)).toBe(false);
  });
});
