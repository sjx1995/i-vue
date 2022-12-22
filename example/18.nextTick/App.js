/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-22 17:04:55
 */
import { h, ref, getCurrentInstance, nextTick } from "../../lib/i-vue.esm.js";

export const App = {
  setup() {
    const count = ref(0);
    const instance = getCurrentInstance();
    const handleAdd = () => {
      for (let i = 0; i < 100; i++) {
        count.value++;
      }
      debugger;
      console.log(instance);
      nextTick(() => {
        console.log(instance);
      });
    };

    return {
      handleAdd,
      count,
    };
  },
  render() {
    console.log("render");
    return h("div", {}, [
      h("div", {}, "count:" + this.count),
      h("button", { onClick: this.handleAdd }, "add"),
    ]);
  },
};
