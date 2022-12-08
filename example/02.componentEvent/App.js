/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-01 02:19:14
 */
import { h } from "../../lib/i-vue.esm.js";

export const App = {
  render() {
    window.self = this;
    return h(
      "button",
      {
        id: "root",
        onClick() {
          console.log("clicked");
        },
      },
      this.buttonText
    );
  },
  setup() {
    return {
      buttonText: "clicked",
    };
  },
};
