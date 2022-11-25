/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-11-25 08:37:01
 */
import { readonly } from "../reactive";

describe("readonly", () => {
  it("实现readonly", () => {
    const original = { foo: 1 };
    const obj = readonly(original);
    expect(obj).not.toBe(original);
    expect(obj.foo).toBe(1);
  });

  it("设置readonly", () => {
    console.warn = jest.fn();
    const obj = readonly({ foo: 1 });
    obj.foo = 2;
    expect(console.warn).toHaveBeenCalled();
  });
});
