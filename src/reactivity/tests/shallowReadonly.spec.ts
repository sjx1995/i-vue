/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-11-28 05:06:37
 */
import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("shallowReadonly", () => {
    const shallowReadonlyObj = shallowReadonly({ foo: { bar: 1 } });
    expect(isReadonly(shallowReadonlyObj)).toBe(true);
    expect(isReadonly(shallowReadonlyObj.foo)).toBe(false);
  });

  it("表层只读的shallowReadonly", () => {
    console.warn = jest.fn();
    const shallowReadonlyObj = shallowReadonly({ foo: { bar: 1 } });
    shallowReadonlyObj.foo.baz = 1;
    expect(console.warn).not.toBeCalled();
    shallowReadonlyObj.foo = { baz: 2 };
    expect(console.warn).toBeCalledTimes(1);
  });
});
