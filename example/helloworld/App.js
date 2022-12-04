/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-01 02:19:14
 */
import { h } from "../../lib/i-vue.esm.js";

export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["main", "main-container"],
      },
      [
        h("span", { class: "red" }, "hello"),
        h("span", { class: "blue" }, " world"),
      ]
    );
  },
  setup() {
    return {
      msg: "world",
    };
  },
};
