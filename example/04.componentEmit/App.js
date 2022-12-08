/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-08 18:28:10
 */
import { h } from "../../lib/i-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
      },
      [
        h("h4", {}, "The example of emit"),
        h(Child, {
          onNotice(a, b) {
            console.log("notice from child", a, b);
          },
          onSayHello(msg) {
            console.log("say hello: ", msg);
          },
        }),
      ]
    );
  },
  setup() {},
};
