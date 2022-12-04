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
        el: null,
    };
    return vnode;
}

/*
 * @Description: 共享的方法
 * @Author: Sunly
 * @Date: 2022-11-27 00:36:18
 */
function isObject(value) {
    return value !== null && typeof value === "object";
}

/*
 * @Description: 挂在到组件中的proxy对象的handler
 * @Author: Sunly
 * @Date: 2022-12-04 19:45:49
 */
const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const componentPublicInstanceHandlers = {
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
    instance.proxy = new Proxy({ _: instance }, componentPublicInstanceHandlers);
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
    patch(vnode, container);
}
function patch(vnode, container) {
    // 处理组件
    processComponent(vnode, container);
}
function processComponent(vnode, container) {
    if (typeof vnode.type === "string") {
        // 挂在元素
        mountElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 挂载组件
        mountComponent(vnode, container);
    }
}
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    const el = document.createElement(type);
    vnode.el = el;
    if (props) {
        for (const key in props) {
            const value = props[key];
            el.setAttribute(key, value);
        }
    }
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.forEach((v) => {
        patch(v, container);
    });
}
function mountComponent(vnode, container) {
    // 创建组件实例
    // 实例上会存储必要的属性
    const instance = createComponentInstance(vnode);
    // 初始化组件
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
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
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
