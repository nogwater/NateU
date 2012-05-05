// my Scheem interpreter
// exposes the eval function

var scheem = {};

scheem.eval = function (expr, env) {
    var name, value, result, i, element, list, left, right;
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            if (expr.length !== 3) {
                throw new Error("'+' expects exactly two parameters")
            }
            left = scheem.eval(expr[1], env);
            right = scheem.eval(expr[2], env);
            if (typeof left !== 'number' || typeof right != 'number') {
                throw new Error("'+' requires two numbers");
            }
            return left + right;
        case '-':
            if (expr.length !== 3) {
                throw new Error("'-' expects exactly two parameters")
            }
            left = scheem.eval(expr[1], env);
            right = scheem.eval(expr[2], env);
            if (typeof left !== 'number' || typeof right != 'number') {
                throw new Error("'-' requires two numbers");
            }
            return left - right;
        case '*':
            if (expr.length !== 3) {
                throw new Error("'*' expects exactly two parameters")
            }
            left = scheem.eval(expr[1], env);
            right = scheem.eval(expr[2], env);
            if (typeof left !== 'number' || typeof right != 'number') {
                throw new Error("'*' requires two numbers");
            }
            return left * right;
        case '/':
            if (expr.length !== 3) {
                throw new Error("'/' expects exactly two parameters")
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
                throw new Error("define expects exactly two parameters")
            }
            name = expr[1]; // might be cool to allow references (expressions that return strings?)
            if (typeof env[name] !== 'undefined') {
                throw new Error("redefining variable not allowed")
            }
            value = scheem.eval(expr[2], env);
            env[name] = value;
            return 0; // why not return the value?
        case 'set!':
            if (expr.length !== 3) {
                throw new Error("set! expects exactly two parameters")
            }
            name = expr[1];
            if (typeof env[name] === 'undefined') {
                throw new Error("variable not defined: " + name)
            }
            value = scheem.eval(expr[2], env);
            // should probably error if env[name] is undefined
            env[name] = value;
            return 0; // why not return the value?
        case 'begin':
            result = 0; // what should this default to?
            for (i = 1; i < expr.length; i++) {
                result = scheem.eval(expr[i], env);
            }
            return result;
        case 'quote':
            if (expr.length !== 2) {
                throw new Error("quote requires exactly one parameter")
            }
            return expr[1];
        case '=':
            if (expr.length !== 3) {
                throw new Error("'=' expects exactly two parameters")
            }
            if (scheem.eval(expr[1], env) === scheem.eval(expr[2], env)) {
                return '#t';
            }
            return '#f';
        case '<':
            if (expr.length !== 3) {
                throw new Error("'<' expects exactly two parameters")
            }
            if (scheem.eval(expr[1], env) < scheem.eval(expr[2], env)) {
                return '#t';
            }
            return '#f';
        case 'cons':
            if (expr.length !== 3) {
                throw new Error("cons expects exactly two parameters")
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
                throw new Error("car expects exactly one parameter")
            }
            list = scheem.eval(expr[1], env);
            if (list.constructor.name !== 'Array') {
                throw new Error("car requires parameter to be a list");
            }
            result = list[0];
            return result;
        case 'cdr':
            if (expr.length !== 2) {
                throw new Error("cdr expects exactly one parameter")
            }
            list = scheem.eval(expr[1], env);
            if (list.constructor.name !== 'Array') {
                throw new Error("cdr requires parameter to be a list");
            }
            list.splice(0, 1);
            return list;
        case 'if':
            if (expr.length !== 4) {
                throw new Error("if expects exactly three parameter")
            }
            if (scheem.eval(expr[1], env) === '#t') {
                return scheem.eval(expr[2], env);
            }
            return scheem.eval(expr[3], env);
    }
};

// for node.js
if (typeof module === 'object') {
    module.exports = {
        'eval': scheem.eval
    };
}
