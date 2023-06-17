
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Menu.svelte generated by Svelte v3.49.0 */

    const file$2 = "src/Menu.svelte";

    // (40:1) {#if menuDisplayText}
    function create_if_block$1(ctx) {
    	let button;
    	let t1;
    	let div;
    	let label;
    	let t3;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Clear";
    			t1 = space();
    			div = element("div");
    			label = element("label");
    			label.textContent = "Join lines";
    			t3 = space();
    			input = element("input");
    			add_location(button, file$2, 40, 2, 854);
    			attr_dev(label, "for", "join-lines");
    			add_location(label, file$2, 42, 3, 921);
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$2, 43, 3, 967);
    			attr_dev(div, "id", "join-lines");
    			add_location(div, file$2, 41, 2, 896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t3);
    			append_dev(div, input);
    			input.checked = /*menuShouldJoinLines*/ ctx[1];

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*clear*/ ctx[5], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuShouldJoinLines*/ 2) {
    				input.checked = /*menuShouldJoinLines*/ ctx[1];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:1) {#if menuDisplayText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let span;
    	let input0;
    	let t0;
    	let p;
    	let t2;
    	let div0;
    	let label;
    	let t4;
    	let input1;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*menuDisplayText*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			input0 = element("input");
    			t0 = space();
    			p = element("p");
    			p.textContent = "(Or press ctrl-V)";
    			t2 = space();
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Dark mode";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			if (if_block) if_block.c();
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "name", "choose file");
    			add_location(input0, file$2, 27, 2, 574);
    			add_location(p, file$2, 33, 2, 664);
    			add_location(span, file$2, 26, 1, 565);
    			attr_dev(label, "for", "theme-toggle");
    			add_location(label, file$2, 36, 2, 725);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$2, 37, 2, 771);
    			attr_dev(div0, "id", "theme-toggle");
    			add_location(div0, file$2, 35, 1, 699);
    			attr_dev(div1, "id", "menu");
    			add_location(div1, file$2, 25, 0, 548);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, input0);
    			/*input0_binding*/ ctx[7](input0);
    			append_dev(span, t0);
    			append_dev(span, p);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(div0, t4);
    			append_dev(div0, input1);
    			input1.checked = /*darkMode*/ ctx[2];
    			append_dev(div1, t5);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[6]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*darkMode*/ 4) {
    				input1.checked = /*darkMode*/ ctx[2];
    			}

    			if (/*menuDisplayText*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input0_binding*/ ctx[7](null);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let { menuDisplayText } = $$props;
    	let { menuShouldJoinLines } = $$props;
    	let { darkMode = false } = $$props;
    	let files;
    	let fileInput;

    	const updateDisplayTextFile = async f => {
    		$$invalidate(0, menuDisplayText = {
    			type: "FileText",
    			fileName: f.name,
    			text: await f.text()
    		});
    	};

    	const clear = () => {
    		$$invalidate(0, menuDisplayText = null);
    		$$invalidate(3, files = null);
    		$$invalidate(4, fileInput.value = null, fileInput);
    	};

    	const writable_props = ['menuDisplayText', 'menuShouldJoinLines', 'darkMode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		files = this.files;
    		$$invalidate(3, files);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileInput = $$value;
    			$$invalidate(4, fileInput);
    		});
    	}

    	function input1_change_handler() {
    		darkMode = this.checked;
    		$$invalidate(2, darkMode);
    	}

    	function input_change_handler() {
    		menuShouldJoinLines = this.checked;
    		$$invalidate(1, menuShouldJoinLines);
    	}

    	$$self.$$set = $$props => {
    		if ('menuDisplayText' in $$props) $$invalidate(0, menuDisplayText = $$props.menuDisplayText);
    		if ('menuShouldJoinLines' in $$props) $$invalidate(1, menuShouldJoinLines = $$props.menuShouldJoinLines);
    		if ('darkMode' in $$props) $$invalidate(2, darkMode = $$props.darkMode);
    	};

    	$$self.$capture_state = () => ({
    		menuDisplayText,
    		menuShouldJoinLines,
    		darkMode,
    		files,
    		fileInput,
    		updateDisplayTextFile,
    		clear
    	});

    	$$self.$inject_state = $$props => {
    		if ('menuDisplayText' in $$props) $$invalidate(0, menuDisplayText = $$props.menuDisplayText);
    		if ('menuShouldJoinLines' in $$props) $$invalidate(1, menuShouldJoinLines = $$props.menuShouldJoinLines);
    		if ('darkMode' in $$props) $$invalidate(2, darkMode = $$props.darkMode);
    		if ('files' in $$props) $$invalidate(3, files = $$props.files);
    		if ('fileInput' in $$props) $$invalidate(4, fileInput = $$props.fileInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*files*/ 8) {
    			{
    				const selectedFile = files && files[0] ? files[0] : null;

    				if (selectedFile) {
    					updateDisplayTextFile(selectedFile);
    				}
    			}
    		}
    	};

    	return [
    		menuDisplayText,
    		menuShouldJoinLines,
    		darkMode,
    		files,
    		fileInput,
    		clear,
    		input0_change_handler,
    		input0_binding,
    		input1_change_handler,
    		input_change_handler
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			menuDisplayText: 0,
    			menuShouldJoinLines: 1,
    			darkMode: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*menuDisplayText*/ ctx[0] === undefined && !('menuDisplayText' in props)) {
    			console.warn("<Menu> was created without expected prop 'menuDisplayText'");
    		}

    		if (/*menuShouldJoinLines*/ ctx[1] === undefined && !('menuShouldJoinLines' in props)) {
    			console.warn("<Menu> was created without expected prop 'menuShouldJoinLines'");
    		}
    	}

    	get menuDisplayText() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuDisplayText(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuShouldJoinLines() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuShouldJoinLines(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get darkMode() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set darkMode(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TextDisplay.svelte generated by Svelte v3.49.0 */

    const file$1 = "src/TextDisplay.svelte";

    // (23:1) {#if displayText && displayText.type === "FileText"}
    function create_if_block_1(ctx) {
    	let h1;
    	let raw_value = /*displayText*/ ctx[0].fileName + "";

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			attr_dev(h1, "id", "filename");
    			attr_dev(h1, "class", "svelte-1s6z1hc");
    			add_location(h1, file$1, 23, 2, 638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			h1.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*displayText*/ 1 && raw_value !== (raw_value = /*displayText*/ ctx[0].fileName + "")) h1.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:1) {#if displayText && displayText.type === \\\"FileText\\\"}",
    		ctx
    	});

    	return block;
    }

    // (26:1) {#if displayText}
    function create_if_block(ctx) {
    	let pre;
    	let t;

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(pre, "id", "text");
    			attr_dev(pre, "class", "svelte-1s6z1hc");
    			add_location(pre, file$1, 26, 2, 718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);
    			append_dev(pre, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(26:1) {#if displayText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*displayText*/ ctx[0] && /*displayText*/ ctx[0].type === "FileText" && create_if_block_1(ctx);
    	let if_block1 = /*displayText*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "id", "text-display");
    			attr_dev(div, "class", "svelte-1s6z1hc");
    			add_location(div, file$1, 21, 0, 558);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayText*/ ctx[0] && /*displayText*/ ctx[0].type === "FileText") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*displayText*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function joinParagraphLines(para) {
    	return para.replaceAll(/\s*(\r\n?|\n)/g, " ");
    }

    function containsNonWhitespace(s) {
    	return s.trim().length > 0;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextDisplay', slots, []);
    	let { displayText } = $$props;
    	let { shouldJoinLines } = $$props;
    	let text;

    	const joinLines = txt => {
    		const paragraphs = txt.split(/(\r\n|\n)(\r\n?|\n)+/);
    		return paragraphs.map(joinParagraphLines).filter(containsNonWhitespace).join("\n\n");
    	};

    	const writable_props = ['displayText', 'shouldJoinLines'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('displayText' in $$props) $$invalidate(0, displayText = $$props.displayText);
    		if ('shouldJoinLines' in $$props) $$invalidate(2, shouldJoinLines = $$props.shouldJoinLines);
    	};

    	$$self.$capture_state = () => ({
    		displayText,
    		shouldJoinLines,
    		text,
    		joinParagraphLines,
    		containsNonWhitespace,
    		joinLines
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayText' in $$props) $$invalidate(0, displayText = $$props.displayText);
    		if ('shouldJoinLines' in $$props) $$invalidate(2, shouldJoinLines = $$props.shouldJoinLines);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*displayText, shouldJoinLines*/ 5) {
    			if (displayText) {
    				$$invalidate(1, text = shouldJoinLines
    				? joinLines(displayText.text)
    				: displayText.text);
    			}
    		}
    	};

    	return [displayText, text, shouldJoinLines];
    }

    class TextDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { displayText: 0, shouldJoinLines: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextDisplay",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*displayText*/ ctx[0] === undefined && !('displayText' in props)) {
    			console.warn("<TextDisplay> was created without expected prop 'displayText'");
    		}

    		if (/*shouldJoinLines*/ ctx[2] === undefined && !('shouldJoinLines' in props)) {
    			console.warn("<TextDisplay> was created without expected prop 'shouldJoinLines'");
    		}
    	}

    	get displayText() {
    		throw new Error("<TextDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayText(value) {
    		throw new Error("<TextDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldJoinLines() {
    		throw new Error("<TextDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldJoinLines(value) {
    		throw new Error("<TextDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let t0;
    	let main;
    	let menu;
    	let updating_menuDisplayText;
    	let updating_menuShouldJoinLines;
    	let updating_darkMode;
    	let t1;
    	let textdisplay;
    	let main_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	function menu_menuDisplayText_binding(value) {
    		/*menu_menuDisplayText_binding*/ ctx[5](value);
    	}

    	function menu_menuShouldJoinLines_binding(value) {
    		/*menu_menuShouldJoinLines_binding*/ ctx[6](value);
    	}

    	function menu_darkMode_binding(value) {
    		/*menu_darkMode_binding*/ ctx[7](value);
    	}

    	let menu_props = {};

    	if (/*displayText*/ ctx[1] !== void 0) {
    		menu_props.menuDisplayText = /*displayText*/ ctx[1];
    	}

    	if (/*shouldJoinLines*/ ctx[2] !== void 0) {
    		menu_props.menuShouldJoinLines = /*shouldJoinLines*/ ctx[2];
    	}

    	if (/*darkMode*/ ctx[0] !== void 0) {
    		menu_props.darkMode = /*darkMode*/ ctx[0];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, 'menuDisplayText', menu_menuDisplayText_binding));
    	binding_callbacks.push(() => bind(menu, 'menuShouldJoinLines', menu_menuShouldJoinLines_binding));
    	binding_callbacks.push(() => bind(menu, 'darkMode', menu_darkMode_binding));

    	textdisplay = new TextDisplay({
    			props: {
    				displayText: /*displayText*/ ctx[1],
    				shouldJoinLines: /*shouldJoinLines*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t1 = space();
    			create_component(textdisplay.$$.fragment);
    			document.title = "TxtReader";
    			attr_dev(main, "class", main_class_value = "" + (null_to_empty(/*theme*/ ctx[3]) + " svelte-g4hu83"));
    			add_location(main, file, 20, 0, 475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(menu, main, null);
    			append_dev(main, t1);
    			mount_component(textdisplay, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main, "paste", /*handlePaste*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const menu_changes = {};

    			if (!updating_menuDisplayText && dirty & /*displayText*/ 2) {
    				updating_menuDisplayText = true;
    				menu_changes.menuDisplayText = /*displayText*/ ctx[1];
    				add_flush_callback(() => updating_menuDisplayText = false);
    			}

    			if (!updating_menuShouldJoinLines && dirty & /*shouldJoinLines*/ 4) {
    				updating_menuShouldJoinLines = true;
    				menu_changes.menuShouldJoinLines = /*shouldJoinLines*/ ctx[2];
    				add_flush_callback(() => updating_menuShouldJoinLines = false);
    			}

    			if (!updating_darkMode && dirty & /*darkMode*/ 1) {
    				updating_darkMode = true;
    				menu_changes.darkMode = /*darkMode*/ ctx[0];
    				add_flush_callback(() => updating_darkMode = false);
    			}

    			menu.$set(menu_changes);
    			const textdisplay_changes = {};
    			if (dirty & /*displayText*/ 2) textdisplay_changes.displayText = /*displayText*/ ctx[1];
    			if (dirty & /*shouldJoinLines*/ 4) textdisplay_changes.shouldJoinLines = /*shouldJoinLines*/ ctx[2];
    			textdisplay.$set(textdisplay_changes);

    			if (!current || dirty & /*theme*/ 8 && main_class_value !== (main_class_value = "" + (null_to_empty(/*theme*/ ctx[3]) + " svelte-g4hu83"))) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(textdisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(textdisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(menu);
    			destroy_component(textdisplay);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let displayText = null;
    	let shouldJoinLines = false;
    	let darkMode = false;
    	let theme = "lightTheme";

    	const handlePaste = ev => {
    		ev.preventDefault();

    		$$invalidate(1, displayText = {
    			type: "Pasted",
    			text: ev.clipboardData.getData("text")
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function menu_menuDisplayText_binding(value) {
    		displayText = value;
    		$$invalidate(1, displayText);
    	}

    	function menu_menuShouldJoinLines_binding(value) {
    		shouldJoinLines = value;
    		$$invalidate(2, shouldJoinLines);
    	}

    	function menu_darkMode_binding(value) {
    		darkMode = value;
    		$$invalidate(0, darkMode);
    	}

    	$$self.$capture_state = () => ({
    		Menu,
    		TextDisplay,
    		displayText,
    		shouldJoinLines,
    		darkMode,
    		theme,
    		handlePaste
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayText' in $$props) $$invalidate(1, displayText = $$props.displayText);
    		if ('shouldJoinLines' in $$props) $$invalidate(2, shouldJoinLines = $$props.shouldJoinLines);
    		if ('darkMode' in $$props) $$invalidate(0, darkMode = $$props.darkMode);
    		if ('theme' in $$props) $$invalidate(3, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*darkMode*/ 1) {
    			$$invalidate(3, theme = darkMode ? "darkTheme" : "lightTheme");
    		}
    	};

    	return [
    		darkMode,
    		displayText,
    		shouldJoinLines,
    		theme,
    		handlePaste,
    		menu_menuDisplayText_binding,
    		menu_menuShouldJoinLines_binding,
    		menu_darkMode_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
