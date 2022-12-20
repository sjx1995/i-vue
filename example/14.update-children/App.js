/*
 * @Description: App.js
 * @Author: Sunly
 * @Date: 2022-12-20 10:49:17
 */
import { h } from "../../lib/i-vue.esm.js";
import { TextToText } from "./TextToText.js";
import { TextToArray } from "./TextToArray.js";
import { ArrayToText } from "./ArrayToText.js";

export const App = {
  setup() {},
  render() {
    // return h(TextToText);
    // return h(TextToArray);
    return h(ArrayToText);
  },
};
