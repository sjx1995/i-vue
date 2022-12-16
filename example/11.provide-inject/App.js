/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-16 16:30:42
 */
import { h, inject, provide } from "../../lib/i-vue.esm.js";

const provider = {
  name: "provider",
  setup() {
    provide("foo", "foo from app");
    provide("bar", "bar from app");
  },
  render() {
    return h("div", { id: "provider" }, [
      h("div", {}, "app provide two value"),
      h(midComponent),
    ]);
  },
};

const midComponent = {
  name: "middle component",
  setup() {
    const foo = inject("foo");
    provide("foo", "foo from middle component");

    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [
      h("div", {}, `middle component's foo value should from app: ${this.foo}`),
      h(consumer),
    ]);
  },
};

const consumer = {
  name: "consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", "default value");
    const otherBaz = inject("bazOther", () => "another default value");

    return {
      foo,
      bar,
      baz,
      otherBaz,
    };
  },
  render() {
    return h("div", { id: "consumer" }, [
      h(
        "dvi",
        {},
        `inject value: foo value should from midComponent: ${this.foo} ; bar: ${this.bar}`
      ),
      h("div", {}, `this is a default value: ${this.baz}`),
      h("div", {}, `this is another default value: ${this.otherBaz}`),
    ]);
  },
};

export const App = {
  setup() {},
  render() {
    return h("div", {}, [
      h("h4", {}, "The example of provide/inject"),
      h(provider),
    ]);
  },
};
