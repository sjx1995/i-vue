// 如果是component，那么type值是一个对象，里面包含了setup()、render()等函数
// 如果是element，那么type值是一个标签名
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlags: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlags |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

/*
 * @Description: 共享的方法
 * @Author: Sunly
 * @Date: 2022-11-27 00:36:18
 */
function isObject(value) {
    return value !== null && typeof value === "object";
}
const extend = Object.assign;
function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
}
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toHandlerKey = (str) => str ? "on" + capitalize(str) : "";

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
        const { setupState, props } = target;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        if (publicPropertiesMap[key]) {
            return publicPropertiesMap[key](target);
        }
    },
};

/*
 * @Description: 处理props
 * @Author: Sunly
 * @Date: 2022-12-08 16:55:13
 */
function initProps(instance, props) {
    instance.props = props || {};
}

const bucket = new WeakMap();
function trigger(target, key) {
    const depsMap = bucket.get(target);
    if (!depsMap)
        return;
    const dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    dep &&
        dep.forEach((effect) => {
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        });
}

/*
 * @Description: proxy对象的handler
 * @Author: Sunly
 * @Date: 2022-11-25 10:02:51
 */
function createGetter(isReadonly = false, isShallow = false) {
    return function (target, key) {
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function (target, key, newValue) {
        Reflect.set(target, key, newValue);
        trigger(target, key);
        return true;
    };
}
const mutableHandlers = {
    get: createGetter(),
    set: createSetter(),
};
const readonlyHandlers = {
    get: createGetter(true),
    set(target) {
        console.warn(`${target}是 readonly 的，不能设置值`);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: createGetter(true, true),
});

/*
 * @Description: reactive
 * @Author: Sunly
 * @Date: 2022-11-25 02:22:38
 */
function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn(target `${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandler);
}
function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

/*
 * @Description: 处理emit
 * @Author: Sunly
 * @Date: 2022-12-08 18:38:14
 */
function emit(instance, event, ...args) {
    const { props } = instance;
    const handler = props[toHandlerKey(camelize(event))];
    handler && handler(...args);
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
        setupState: {},
        props: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
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
    const { shapeFlags } = vnode;
    if (shapeFlags & 1 /* ShapeFlags.ELEMENT */) {
        // 处理元素
        processElement(vnode, container);
    }
    else if (shapeFlags & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, children, shapeFlags } = vnode;
    const el = document.createElement(type);
    vnode.el = el;
    if (props) {
        for (const key in props) {
            const value = props[key];
            const isOn = (str) => /^on[A-Z]/.test(str);
            if (isOn(key)) {
                const event = key.slice(2).toLowerCase();
                el.addEventListener(event, props[key]);
            }
            else {
                el.setAttribute(key, value);
            }
        }
    }
    if (shapeFlags & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlags & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 创建组件实例
    // 实例上会存储必要的属性
    // 在instance上挂载vnode、type
    const instance = createComponentInstance(vnode);
    // 初始化组件
    // 挂载setupState
    // 挂载组件代理对象proxy
    // 挂载render
    setupComponent(instance);
    // 取出组件代理对象proxy，绑定其为this执行render
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    // 执行完render函数之后，返回的是根节点的vnode对象
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

/*
 * @Description: h函数，对createVNode进行封装，方便调用
 * @Author: Sunly
 * @Date: 2022-12-04 19:40:29
 */
function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
