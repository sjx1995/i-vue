/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-19 14:50:41
 */
import { h, ref } from "../../lib/i-vue.esm.js";

export const App = {
  setup() {
    const count = ref(0);
    const handleAdd = () => {
      count.value++;
    };

    return {
      count,
      handleAdd,
    };
  },
  render() {
    return h("div", {}, [
      h("h4", {}, "The example of update"),
      h("div", {}, `count: ${this.count}`),
      h(
        "button",
        {
          onClick: this.handleAdd,
        },
        "count +1"
      ),
    ]);
  },
};
