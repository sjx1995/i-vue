/*
 * @Description: component
 * @Author: Sunly
 * @Date: 2022-12-01 03:10:16
 */
import { componentPublicInstanceHandlers } from "./componentPublicInstanceHandlers";
import { initProps } from "./componentProps";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
  };

  component.emit = emit.bind(null, component) as any;

  return component;
}

export function setupComponent(instance) {
  // 初始化
  initProps(instance, instance.vnode.props);
  // initSlots()
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  instance.proxy = new Proxy({ _: instance }, componentPublicInstanceHandlers);

  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}
