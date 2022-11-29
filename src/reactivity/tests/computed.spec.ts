/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-11-29 16:41:26
 */
import { reactive } from "../reactive";
import { computed } from "../computed";

describe("computed", () => {
  it("happy path", () => {
    const reactiveObj = reactive({ foo: 1 });
    const data = computed(() => reactiveObj.foo);
    expect(data.value).toBe(1);
  });

  it("实现computed", () => {
    const reactiveObj = reactive({ foo: 1 });
    const getter = jest.fn(() => reactiveObj.foo);
    const comp = computed(getter);

    // computed的回调是懒执行的
    expect(getter).not.toHaveBeenCalled();
    console.log(comp.value);
    expect(getter).toBeCalledTimes(1);

    // 缓存，不会重复调用
    console.log(comp.value);
    expect(getter).toBeCalledTimes(1);

    // 懒执行：修改依赖并会不执行computed
    reactiveObj.foo = 2;
    expect(getter).toBeCalledTimes(1);

    // 需要时才执行
    expect(comp.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // 缓存
    console.log(comp.value);
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
