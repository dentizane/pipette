Object.defineProperty(exports, '__esModule', {
    value: true
});

const EventEmitter = require('events').EventEmitter;
const net = require('net');

class PipeEmitter extends EventEmitter {
    constructor(pipeName, autoStart) {
        super();
        this.pipeName = pipeName;
        this.pipeAddress = '\\\\.\\pipe\\' + this.pipeName;
        this.pipeListeners = {};
        this.pipeListenersAll = [];
        if (autoStart !== false) {
            this.listenToPipe();
        }
    }

    listenToPipe() {
        this.listenPipe = net.createServer((function(_this) {
          return function(stream) {
            return _this.createStream(stream);
          };
        })(this));
        return this.listenPipe.listen(this.pipeAddress);
    }
  
    createStream(stream) {
        return stream.on('data', PipeEmitter.prototype.handleWrite.bind(this));
    }
  
    handleWrite(str) {
        str = String(str).trim();
        var event = str.split(' ', 1)[0];
        var args = str.slice(event.length + 1);
        
        const listeners = this.pipeListeners[event] ? [...this.pipeListeners[event]] : [];
        for (const listener of listeners.concat(this.pipeListenersAll)) {
            listener.call(this, event, args);
        }
    }

    on(event, handler) {
        if (!this.pipeListeners[event]) {
            this.pipeListeners[event] = [];
        }
        this.pipeListeners[event].push(handler);
    }

    onAll(handler) {
        this.pipeListenersAll.push(handler);
    }
  
    send(...strs) {
        var pipe = net.connect(this.pipeAddress);
        pipe.write(strs.join(' '));
        return pipe.end();
    }
}

class PipeSender {
    constructor(pipeName) {
        this.pipeName = pipeName;
        this.pipeAddress = '\\\\.\\pipe\\' + this.pipeName;
    }

    send(...strs) {
        var pipe = net.connect(this.pipeAddress);
        pipe.write(strs.join(' '));
        return pipe.end();
    }
}

module.exports = {
    listen(pipeName) {
        return new PipeEmitter(pipeName, true);
    },
    connect(pipeName) {
        return new PipeSender(pipeName);
    },
    send(pipeName, ...strs) {
        try {
            var pipe = net.connect('\\\\.\\pipe\\' + pipeName);
            pipe.write(strs.join(' '));
            pipe.end();
            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    },
    PipeEmitter,
    PipeSender
};