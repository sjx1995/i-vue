/*
 * @Description: app
 * @Author: Sunly
 * @Date: 2022-12-19 17:52:16
 */
import { h, ref } from "../../lib/i-vue.esm.js";

export const App = {
  setup() {
    const props = ref({
      foo: "foo",
      bar: "bar",
    });
    const handleEmit1 = () => {
      props.value.foo = "newVal";
    };
    const handleEmit2 = () => {
      props.value.foo = null;
    };
    const handleEmit3 = () => {
      props.value = { bar: "bar" };
    };

    return {
      props,
      handleEmit1,
      handleEmit2,
      handleEmit3,
    };
  },
  render() {
    return h("div", { ...this.props }, [
      h("h4", {}, "The example of update Dom when edit props"),
      h(
        "button",
        {
          onClick: this.handleEmit1,
        },
        "更改元素foo:foo 为 foo:newVal"
      ),
      h(
        "button",
        {
          onClick: this.handleEmit2,
        },
        "删除元素的foo属性"
      ),
      h(
        "button",
        {
          onClick: this.handleEmit3,
        },
        "更新元素的属性只有 {bar: bar}"
      ),
    ]);
  },
};
