/*
 * @Description: Child
 * @Author: Sunly
 * @Date: 2022-12-08 18:29:48
 */
import { h } from "../../lib/i-vue.esm.js";

export const Child = {
  render() {
    return h(
      "button",
      {
        onClick: this.handleClick,
      },
      "click me"
    );
  },
  setup(props, { emit }) {
    const handleClick = () => {
      emit("notice", "arg1", "arg2");
      emit("say-hello", "hello world");
    };

    return {
      handleClick,
    };
  },
};
