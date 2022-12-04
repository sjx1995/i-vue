/*
 * @Description: 挂在到组件中的proxy对象的handler
 * @Author: Sunly
 * @Date: 2022-12-04 19:45:49
 */
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};

export const componentPublicInstanceHandlers = {
  get({ _: target }, key) {
    const { setupState } = target;
    if (key in setupState) {
      return setupState[key];
    }

    if (publicPropertiesMap[key]) {
      return publicPropertiesMap[key](target);
    }
  },
};
