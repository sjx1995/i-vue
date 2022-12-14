/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-01 02:19:14
 */
import { h } from "../../lib/i-vue.esm.js";

window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["main", "main-container"],
      },
      [
        h("span", { class: "red" }, "hello"),
        h("span", { class: "blue" }, " world"),
        h("div", {}, `hello ${this.msg}`),
      ]
    );
  },
  setup() {
    return {
      msg: "world",
    };
  },
};
