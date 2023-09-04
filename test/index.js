/**
 * Overwatch
 * @param [callback] Callback
 */
function overwatch(callback) {
    window.addEventListener('error', ev => {
        callback('exception', ev);
    }, true);
    window.addEventListener('unhandledrejection', ev => {
        callback('exception', ev);
    }, true);
}

/**l
 * Exception Message
 */
class ExceptionMessage {
    type = '';
    message = '';
    stack = '';
    filename;
    line;
    column;
    name;
    /**
     * Resolve from data
     * @return instance
     */
    static from(ev) {
        let value = new ExceptionMessage();
        if (ev instanceof ErrorEvent) {
            Object.assign(value, {
                type: 'error',
                message: ev.message ?? ev.error?.toString(),
                stack: ev.error?.stack,
                filename: ev.filename,
                line: ev.error?.lineNo,
                column: ev.error?.colNo,
                name: ev.error?.name
            });
        }
        else if (ev instanceof PromiseRejectionEvent) {
            Object.assign(value, {
                type: 'promise',
                message: ev.reason?.message ?? ev.reason?.toString(),
                stack: ev.reason?.stack,
                line: ev.reason?.lineNo,
                column: ev.reason?.colNo,
                name: ev.reason?.name
            });
        }
        else if (ev instanceof Event) {
            Object.assign(value, {
                type: 'event',
                message: ev.type,
                stack: ev.target.outerHTML
            });
        }
        else {
            Object.assign(value, {
                type: '',
                message: ev.message,
                stack: ev.stack,
                name: ev.name
            });
        }
        return value;
    }
}

/**
 * Monitor
 */
class Monitor {
    options;
    /**
     * Constructor
     * @param options Options
     */
    constructor(options) {
        this.options = Object.assign({ server: '' }, options);
        overwatch((type, ev) => {
            let message;
            if (type === 'exception') {
                message = ExceptionMessage.from(ev);
            }
            if (message) {
                if (this.options.server) ;
                else {
                    console.log(message);
                }
            }
        });
    }
}
/**
 * Initiate
 * @param [server] The receive server address
 */
function initiate(server) {
    let monitor = new Monitor({ server });
    return monitor;
}

export { initiate };
