'use strict';

/*
 * @Description: vnode
 * @Author: Sunly
 * @Date: 2022-12-01 02:41:30
 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

/*
 * @Description: component
 * @Author: Sunly
 * @Date: 2022-12-01 03:10:16
 */
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    // 初始化
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
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

/*
 * @Description: render
 * @Author: Sunly
 * @Date: 2022-12-01 02:56:33
 */
function render(vnode, container) {
    // 方便递归调用
    patch(vnode);
}
function patch(vnode, container) {
    // 处理组件
    processComponent(vnode);
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    // 创建组件实例
    // 实例上会存储必要的属性
    const instance = createComponentInstance(vnode);
    // 初始化组件
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-12-01 02:35:15
 */
function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 转换成虚拟节点，之后所有的操作都基于虚拟节点
            const vnode = createVNode(rootComponent);
            if (typeof rootContainer === "string") {
                rootContainer = document.querySelector(rootContainer);
            }
            render(vnode);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
