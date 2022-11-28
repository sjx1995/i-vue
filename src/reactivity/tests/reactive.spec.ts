/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-10-15 19:48:53
 */
import { isReactive, reactive, readonly, isProxy } from "../reactive";

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

  it("嵌套的reactive", () => {
    const reactiveObj = reactive({
      foo: {
        val: 1,
      },
      bar: {
        baz: [{ val: 1 }],
      },
    });
    expect(isReactive(reactiveObj)).toBe(true);
    expect(isReactive(reactiveObj.foo)).toBe(true);
    expect(isReactive(reactiveObj.bar)).toBe(true);
    expect(isReactive(reactiveObj.bar.baz)).toBe(true);
    expect(isReactive(reactiveObj.bar.baz[0])).toBe(true);
  });

  it("isProxy检测是不是reactive对象", () => {
    const original = { foo: 1 };
    const reactiveObj = reactive(original);
    expect(isProxy(original)).toBe(false);
    expect(isProxy(reactiveObj)).toBe(true);
  });
});
