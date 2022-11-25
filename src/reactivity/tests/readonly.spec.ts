/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-11-25 08:37:01
 */
import { readonly, isReadonly } from "../reactive";

describe("readonly", () => {
  it("实现readonly", () => {
    const original = { foo: 1 };
    const readonlyObj = readonly(original);
    expect(readonlyObj).not.toBe(original);
    expect(readonlyObj.foo).toBe(1);
  });

  it("设置readonly", () => {
    console.warn = jest.fn();
    const obj = readonly({ foo: 1 });
    obj.foo = 2;
    expect(console.warn).toHaveBeenCalled();
  });

  it("判断是不是readonly", () => {
    const original = { foo: 1 };
    const readonlyObj = readonly(original);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(readonlyObj)).toBe(true);
  });
});
