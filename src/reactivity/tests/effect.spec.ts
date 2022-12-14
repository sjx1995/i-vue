/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-10-15 19:10:40
 */
import { effect, stop } from "../effect";
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
    // 返回effect携带的回调
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(2);
    // 执行回调可以获取回调函数的返回值
    const res = runner();
    expect(foo).toBe(3);
    expect(res).toBe("foo");
  });

  it("scheduler", () => {
    let dummy;
    const scheduler = jest.fn();
    const obj = reactive({ foo: 1 });
    // 副作用函数携带一个scheduler
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );
    // 注册副作用函数的时候，执行第一个回调并返回，不执行scheduler
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // 触发依赖，执行scheduler而不是副作用函数，即收集的依赖是scheduler
    obj.foo++;
    expect(scheduler).toBeCalledTimes(1);
    expect(dummy).toBe(1);
    // 副作用函数正常执行
    runner();
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ foo: 1 });
    const runner = effect(() => {
      dummy = obj.foo;
    });
    // 正确触发副作用函数
    obj.foo = 2;
    expect(dummy).toBe(2);
    // 调用stop，停止触发副作用函数
    stop(runner);
    obj.foo = 3;
    expect(dummy).toBe(2);
    // 手动触发副作用函数
    runner();
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    let dummy;
    const obj = reactive({ foo: 1 });
    // 在调用stop()的时候，执行传入的回调onStop
    let onStop = jest.fn();
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });

  it("stop 的 edge case", () => {
    const obj = reactive({ foo: 1 });
    let dummy;
    const runner = effect(() => {
      dummy = obj.foo;
    });
    stop(runner);
    // 会触发getter和effect重新track已经删除的依赖
    obj.foo++;
    expect(dummy).toBe(1);
  });
});
