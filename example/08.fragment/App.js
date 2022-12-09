/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-09 17:09:03
 */
import { h } from "../../lib/i-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  render() {
    const app = h("h4", {}, "The example of fragment");
    const foo = h(
      Foo,
      {},
      {
        header: ({ msg }) => h("div", {}, msg),
        footer: () => h("div", {}, "footer slot"),
      }
    );

    return h("div", { id: "root" }, [app, foo]);
  },
  setup() {},
};
