/*
 * @Description: 挂在到组件中的proxy对象的handler
 * @Author: Sunly
 * @Date: 2022-12-04 19:45:49
 */
import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};

export const componentPublicInstanceHandlers = {
  get({ _: target }, key) {
    const { setupState, props } = target;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    if (publicPropertiesMap[key]) {
      return publicPropertiesMap[key](target);
    }
  },
};
