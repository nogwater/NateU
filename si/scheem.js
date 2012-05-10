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


scheem.eval = function (expr, env) {
    var name, value, result, i, element, list, left, right;

    if (typeof env !== 'object') {
        throw new Error("scheem.eval requires an env object");
    }

    if (!env.bindings) {
        env.bindings = {};
        env.outer = null;
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
        case '+':
            if (expr.length !== 3) {
                throw new Error("'+' expects exactly two parameters");
            }
            left = scheem.eval(expr[1], env);
            right = scheem.eval(expr[2], env);
            if (typeof left !== 'number' || typeof right != 'number') {
                throw new Error("'+' requires two numbers");
            }
            return left + right;
        case '-':
            if (expr.length !== 3) {
                throw new Error("'-' expects exactly two parameters");
            }
            left = scheem.eval(expr[1], env);
            right = scheem.eval(expr[2], env);
            if (typeof left !== 'number' || typeof right != 'number') {
                throw new Error("'-' requires two numbers");
            }
            return left - right;
        case '*':
            if (expr.length !== 3) {
                throw new Error("'*' expects exactly two parameters");
            }
            left = scheem.eval(expr[1], env);
            right = scheem.eval(expr[2], env);
            if (typeof left !== 'number' || typeof right != 'number') {
                throw new Error("'*' requires two numbers");
            }
            return left * right;
        case '/':
            if (expr.length !== 3) {
                throw new Error("'/' expects exactly two parameters");
            }
            left = scheem.eval(expr[1], env);
            right = scheem.eval(expr[2], env);
            if (typeof left !== 'number' || typeof right != 'number') {
                throw new Error("'/' requires two numbers");
            }
            if (right === 0) {
                throw new Error("can't divide by zero");
            }
            return left / right;
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
        case '=':
            if (expr.length !== 3) {
                throw new Error("'=' expects exactly two parameters");
            }
            if (scheem.eval(expr[1], env) === scheem.eval(expr[2], env)) {
                return '#t';
            }
            return '#f';
        case '<':
            if (expr.length !== 3) {
                throw new Error("'<' expects exactly two parameters");
            }
            if (scheem.eval(expr[1], env) < scheem.eval(expr[2], env)) {
                return '#t';
            }
            return '#f';
        case 'cons':
            if (expr.length !== 3) {
                throw new Error("cons expects exactly two parameters");
            }
            element = scheem.eval(expr[1], env);
            list = scheem.eval(expr[2], env);
            if (list.constructor.name !== 'Array') {
                throw new Error("cons requires second parameter to be a list");
            }
            list.splice(0, 0, element);
            return list;
        case 'car':
            if (expr.length !== 2) {
                throw new Error("car expects exactly one parameter");
            }
            list = scheem.eval(expr[1], env);
            if (list.constructor.name !== 'Array') {
                throw new Error("car requires parameter to be a list");
            }
            result = list[0];
            return result;
        case 'cdr':
            if (expr.length !== 2) {
                throw new Error("cdr expects exactly one parameter");
            }
            list = scheem.eval(expr[1], env);
            if (list.constructor.name !== 'Array') {
                throw new Error("cdr requires parameter to be a list");
            }
            list.splice(0, 1);
            return list;
        case 'if':
            if (expr.length !== 4) {
                throw new Error("if expects exactly three parameter");
            }
            if (scheem.eval(expr[1], env) === '#t') {
                return scheem.eval(expr[2], env);
            }
            return scheem.eval(expr[3], env);
        case 'let-one':
            var bnds = {};
            bnds[expr[1]] = scheem.eval(expr[2], env);
            var new_env = {bindings: bnds, outer: env};
            return scheem.eval(expr[3], new_env);
        case 'lambda-one':
            // New code here
            var arg_name = expr[1];
            var body = expr[2];
            return function (arg) {
                var bnd = {};
                bnd[arg_name] = arg;
                // note the lexical scoping
                var newenv = {bindings: bnd, outer: env};
                return scheem.eval(body, newenv);
            };
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
                    args.push(scheem.eval(expr[1], env));
                }
                return fun.apply(null, args);
            }
            // var expr0 = scheem.eval(expr[0], env);
            // if (typeof expr0 === 'function') {
            //     var expr1 = scheem.eval(expr[1], env);
            //     return expr0(expr1);
            // }
    }
};

scheem.evalString = function (scheemString, env) {
    if (!env) {
        env = {};
    };
    var ast = scheem.parse(scheemString);
    var result = scheem.eval(ast, env)
    return result;
};

// for node.js
if (typeof module === 'object') {
    module.exports = scheem;
}

