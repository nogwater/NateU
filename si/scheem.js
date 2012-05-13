// my Scheem interpreter
// exposes eval, and evalString functions

var scheem = scheem || {};

// parser comes from parser.js
// add my eval function

// env now looks like:
// {} or { bindings: {'name': 'value'}, outer: parent_env }

scheem.update = function (env, name, val) {
    if (!env) {
        // we probably tunnled all the way to outer = null
        throw new Error("update failed; variable not defined: " + name);
    }
    if (!env.bindings) {
        env.bindings = {};
    }
    if (env && env.bindings) {
        if (env.bindings.hasOwnProperty(name)) {
            env.bindings[name] = val;
        } else {
            scheem.update(env.outer, name, val);
        }
    } else {
    }
};

scheem.lookup = function (env, name) {
    if (env && env.bindings) {
        if (env.bindings.hasOwnProperty(name)) {
            return env.bindings[name];
        } else {
            return scheem.lookup(env.outer, name);
        }
    } else {
        // throw new Error("lookup failed; variable not defined: " + name);
    }
};

scheem.standardLibrary = {
    '+': function () {
        var s = 0; // TODO: how would this work if we wanted + to do string concat too?
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg !== 'number') {
                throw new Error ("can't use '+' with non-number")
            }
            s += arg;
        }
        return s;
    },
    '-': function () {
        if (arguments.length === 0) {
            throw new Error ("'-' requires at least one arg");
        }
        if (typeof arguments[0] !== 'number') {
            throw new Error ("can't use '-' with non-number");
        }
        var result = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg !== 'number') {
            throw new Error ("can't use '-' with non-number");
            }
            result -= arg;
        }
        return result;
    },
    '*': function () {
        var result = 1;
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg !== 'number') {
                throw new Error ("can't use '*' with non-number")
            }
            result *= arg;
        }
        return result;
    },
    '/': function () {
        if (arguments.length === 0) {
            throw new Error ("'/' requires at least one arg");
        }
        if (typeof arguments[0] !== 'number') {
            throw new Error ("can't use '/' with non-number");
        }
        var result = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg !== 'number') {
                throw new Error ("can't use '/' with non-number");
            }
            if (arg === 0) {
                throw new Error("can't divide by zero");
            }
            result /= arg;
        }
        return result;
    }, 
    '=': function () {
        // true if all args are equal to first
        if (arguments.length < 2) {
            throw new Error("'=' expects at least two parameters");
        }
        var first = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var arg = arguments[i];
            if (first !== arg) {
                return '#f';
            }
        }
        return '#t';
    }, 
    '<': function () {
        // true if arguments are increasing
        if (arguments.length < 2) {
            throw new Error("'<' expects at least two parameters");
        }
        for (var i = 0; i < arguments.length - 1; i++) {
            var curr = arguments[i + 0];
            var next = arguments[i + 1];
            if (curr >= next) {
                return '#f';
            }
        }
        return '#t';
    }, 
    'cons': function () {
        if (arguments.length !== 2) {
            throw new Error("cons expects exactly two parameters");
        }
        var element = arguments[0];
        var list = arguments[1];
        if (list.constructor.name !== 'Array') {
            throw new Error("cons requires second parameter to be a list");
        }
        list.splice(0, 0, element);
        return list;
    }, 
    'car': function () {
        if (arguments.length !== 1) {
            throw new Error("car expects exactly one argument");
        }
        var list = arguments[0];
        if (list.constructor.name !== 'Array') {
            throw new Error("car requires argument to be a list");
        }
        return list[0];
    }, 
    'cdr': function() {
        if (arguments.length !== 1) {
            throw new Error("car expects exactly one argument");
        }
        var list = arguments[0];
        if (list.constructor.name !== 'Array') {
            throw new Error("car requires argument to be a list");
        }
        list.splice(0, 1);
        return list;
    }, 
    'alert': function (message) {
        if (typeof console === 'object' && typeof console.log === 'function') {
            console.log(message);
        } else if (typeof alert === 'function') {
            alert(message);
        }
    }
};

scheem.injectStandardLibrary = function (bindings) {
    for (var name in scheem.standardLibrary) {
        if (scheem.standardLibrary.hasOwnProperty(name)) {
            bindings[name] = scheem.standardLibrary[name];
        }
    }
};

scheem.eval = function (expr, env) {
    var name, value, result, i, element, list, left, right;

    if (!env) {
        env = { };
    };

    if (!env.bindings) {
        env.bindings = {};
        scheem.injectStandardLibrary(env.bindings);
    }

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return scheem.lookup(env, expr);
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case 'define':
            if (expr.length !== 3) {
                throw new Error("define expects exactly two parameters");
            }
            name = expr[1]; // might be cool to allow references (expressions that return strings?)
            if (typeof env.bindings[name] !== 'undefined') {
                throw new Error("redefining variable not allowed")
            }
            value = scheem.eval(expr[2], env);
            env.bindings[name] = value;
            return 0; // why not return the value?
        case 'set!':
            if (expr.length !== 3) {
                throw new Error("set! expects exactly two parameters");
            }
            name = expr[1];
            value = scheem.eval(expr[2], env);
            scheem.update(env, name, value);
            return 0; // why not return the value?
        case 'begin':
            result = 0; // what should this default to?
            for (i = 1; i < expr.length; i++) {
                result = scheem.eval(expr[i], env);
            }
            return result;
        case 'quote':
            if (expr.length !== 2) {
                throw new Error("quote requires exactly one parameter");
            }
            return expr[1];
        case 'if':
            if (expr.length !== 4) {
                throw new Error("if expects exactly three parameter");
            }
            if (scheem.eval(expr[1], env) === '#t') {
                return scheem.eval(expr[2], env);
            }
            return scheem.eval(expr[3], env);
        case 'let':
            var bnds = {};
            // adds pairs of name/values
            for (var i = 1; i < expr.length - 1; i += 2) {
                bnds[expr[i]] = scheem.eval(expr[i+1], env);
            }
            var new_env = {bindings: bnds, outer: env};
            return scheem.eval(expr[3], new_env);
        case 'lambda':
            // New code here
            var args = expr.slice(1, expr.length - 1);
            var body = expr[expr.length - 1];
            return function () {
                var bnd = {};
                for (var i = 0; i < arguments.length; i++) {
                    bnd[args[i]] = arguments[i];
                }
                // note the lexical scoping
                var newenv = {bindings: bnd, outer: env};
                return scheem.eval(body, newenv);
            };
        default:
            // application of functions
            var fun = scheem.eval(expr[0], env);
            if (typeof fun === 'function') {
                var args = [];
                for(var i = 1; i < expr.length; i++) {
                    args.push(scheem.eval(expr[i], env));
                }
                return fun.apply(null, args);
            }
    }
};

scheem.evalString = function (scheemString, env) {
    var ast = scheem.parse(scheemString);
    var result = scheem.eval(ast, env)
    return result;
};

// for node.js
if (typeof module === 'object') {
    module.exports = scheem;
}

