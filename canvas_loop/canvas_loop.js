
function canvas_loop(canvas_element, updater) {

    function find_canvas(canvas_element) {
        if (canvas_element instanceof HTMLCanvasElement) return canvas_element;
        const selector = canvas_element || "canvas";
        const element = document.querySelector(selector);
        if (element instanceof HTMLCanvasElement) return element;
        throw new Error(`Canvas not found ${canvas_element}`);
    }

    const canvas = find_canvas(canvas_element);
    const holder = canvas.parentElement;

    const context = canvas.getContext("2d");
    const rect = { w: 0, h: 0 };
    const size = { w: 0, h: 0 };

    let samples_root = 1;
    let line_width = 1;

    function setup_listeners() {

        function resize_listener() {
            const r = holder.getBoundingClientRect();
            rect.w = r.width;
            rect.h = r.height;
            let w = Math.ceil(r.width);
            let h = Math.ceil(r.height);
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            w *= window.devicePixelRatio * samples_root;
            h *= window.devicePixelRatio * samples_root;
            canvas.width = w;
            canvas.height = h;
            size.w = w;
            size.h = h;
            line_width = window.devicePixelRatio * samples_root;
        }
        holder.addEventListener("resize", resize_listener)
        window.addEventListener("resize", resize_listener);
        resize_listener();

        window.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    }

    setup_listeners();

    class ContextWrapper extends CanvasRenderingContext2D {
        wrapper_init() {
            this.save_stack_size = 0;
        }

        save() {
            super.save();
            this.save_stack_size += 1;
        }
        restore() {
            super.restore();
            this.save_stack_size -= 1;
            if (this.save_stack_size < 0) throw new Error("Missing save call");
        }
        restoreLast() {
            super.restore();
            this.save_stack_size -= 1;
            if (this.save_stack_size > 0) throw new Error("Missing restore call");
            if (this.save_stack_size < 0) throw new Error("Missing save call");
        }
    }

    Object.setPrototypeOf(context, ContextWrapper.prototype);
    context.wrapper_init();

    canvas_loop = function canvas_loop(delta) {
        const g = context;
        const { w, h } = size;

        g.lineWidth = line_width;

        g.clearRect(0, 0, w, h);
        g.save();

        const layers = [];
        updater(g, w, h, delta, layers, rect.w, rect.h);
        for (const i of layers) i(g);

        g.restoreLast();
    }

    return canvas_loop(0);
}