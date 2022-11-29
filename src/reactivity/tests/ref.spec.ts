/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-11-29 11:03:19
 */
import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const data = ref(1);
    expect(data.value).toBe(1);
  });

  it("ref的响应式", () => {
    const data = ref(1);
    let count = 0;
    let dummy;
    effect(() => {
      dummy = data.value;
      count++;
    });
    // 注册副作用函数会执行一次
    expect(dummy).toBe(1);
    expect(count).toBe(1);
    // 修改响应式ref，会触发副作用函数执行
    data.value = 2;
    expect(dummy).toBe(2);
    expect(count).toBe(2);
    // ref带有缓存
    data.value = 2;
    expect(dummy).toBe(2);
    expect(count).toBe(2);
  });

  it("ref支持对象", () => {
    const data = ref({ foo: 1 });
    let dummy;
    // ref如果传入对象，底层使用的还是reactive
    // 下面的副作用函数中，使用data是ref，data.value是reactive
    // 所以读取到data.value.reactive的时候，就会触发reactive的响应式
    // 此时target是{foo:1}，key是'foo'
    effect(() => {
      dummy = data.value.foo;
    });
    expect(dummy).toBe(1);
    data.value.foo = 2;
    expect(dummy).toBe(2);
  });

  it("实现isRef", () => {
    const data = ref(1);
    const reactiveObj = reactive({ foo: 1 });
    expect(isRef(data)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(reactiveObj)).toBe(false);
  });

  it("实现unRef", () => {
    const data = ref(1);
    expect(unRef(data)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  // 在js中要使用.value来取值，但是模板中就不需要
  // 这就是proxyRefs的作用
  it("实现proxyRefs", () => {
    const data = {
      foo: 1,
      bar: ref(2),
    };
    const proxyData = proxyRefs(data);
    expect(data.bar.value).toBe(2);
    expect(proxyData.foo).toBe(1);
    expect(proxyData.bar).toBe(2);

    proxyData.bar = 3;
    expect(data.bar.value).toBe(3);
    expect(proxyData.bar).toBe(3);

    proxyData.bar = ref(4);
    expect(data.bar.value).toBe(4);
    expect(proxyData.bar).toBe(4);
  });
});
