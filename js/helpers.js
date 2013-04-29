// Should be safe as long as I'm not utilizing prototypes...
if (!Function.prototype.method) {
    Function.prototype.method = function (name, func) {
        "use strict";
        if (!this[name]) {
            this[name] = func;
        }

        return this;
    };
}
