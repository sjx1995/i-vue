/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-10-15 19:10:40
 */
import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    // 创建一个响应式对象和副作用函数
    const obj = reactive({ foo: 1 });
    let bar;
    effect(() => {
      bar = obj.foo;
    });
    expect(bar).toBe(1);

    // 修改响应式对象的值，并触发副作用函数执行
    obj.foo++;
    expect(bar).toBe(2);
  });

  it("返回一个runner", () => {
    let foo = 1;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(2);
    const res = runner();
    expect(foo).toBe(3);
    expect(res).toBe("foo");
  });
});
