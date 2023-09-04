const temp = new WeakMap();
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
    XMLHttpRequest.prototype.open = new Proxy(XMLHttpRequest.prototype.open, {
        apply: (target, that, args) => {
            temp.set(that, args);
            return Reflect.apply(target, that, args);
        }
    });
    XMLHttpRequest.prototype.send = new Proxy(XMLHttpRequest.prototype.send, {
        apply: (target, that, args) => {
            try {
                if (temp.has(that)) {
                    that.addEventListener('timeout', () => {
                        let [method, url] = temp.get(that);
                        callback('request', {
                            method,
                            url,
                            status: that.status,
                            body: args[0]
                        });
                        temp.delete(that);
                    });
                    that.addEventListener('readystatechange', () => {
                        if (that.readyState === XMLHttpRequest.DONE) {
                            let [method, url] = temp.get(that);
                            callback('request', {
                                method,
                                url,
                                status: that.status,
                                body: args[0],
                                data: that.response
                            });
                            temp.delete(that);
                        }
                    });
                }
            }
            catch (er) {
                console.error(er);
            }
            return Reflect.apply(target, that, args);
        }
    });
    window.fetch = new Proxy(window.fetch, {
        apply: (target, that, args) => {
            let url = args[0] instanceof URL ? args[0].href : args[0];
            let { method = 'GET', body } = args[1] ?? {};
            return Reflect.apply(target, that, args)
                .then((res) => {
                res.text().then(data => {
                    callback('request', {
                        method,
                        url,
                        status: res.status,
                        body,
                        data
                    });
                });
                return res;
            })
                .catch(er => {
                callback('request', {
                    method,
                    url,
                    status: 0,
                    body
                });
                throw er;
            });
        }
    });
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
     * @param [ev] Event
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
 * Request Message
 */
class RequestMessage {
    method = '';
    url = '';
    body;
    status = 0;
    data;
    /**
     * Resolve from data
     * @param [ev] Event
     * @return instance
     */
    static from(ev) {
        let value = new RequestMessage();
        Object.assign(value, {
            method: ev['method'] ?? '',
            url: ev['url'] ?? '',
            body: ev['body'],
            status: ev['status'] ?? 0,
            data: ev['data']
        });
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
     * @param [options] Options
     */
    constructor(options) {
        this.options = Object.assign({ server: '' }, options);
        overwatch((type, ev) => {
            let message;
            if (type === 'exception') {
                message = ExceptionMessage.from(ev);
            }
            else if (type === 'request') {
                message = RequestMessage.from(ev);
            }
            if (message) {
                if (this.options.server) {
                    // TODO 域名与服务器一致时不发送
                }
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
