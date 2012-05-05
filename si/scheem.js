// my Scheem interpreter
// exposes the eval function

var scheem = {};

scheem.eval = function (expr, env) {
    var name, value, result, i, element, list;
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
            return scheem.eval(expr[1], env) + scheem.eval(expr[2], env);
        case '-':
            return scheem.eval(expr[1], env) - scheem.eval(expr[2], env);
        case '*':
            return scheem.eval(expr[1], env) * scheem.eval(expr[2], env);
        case '/':
            return scheem.eval(expr[1], env) / scheem.eval(expr[2], env);
        case 'define':
            name = expr[1]; // might be cool to allow references (expressions that return strings?)
            value = scheem.eval(expr[2], env);
            // should probably error if env[name] is NOT undefined
            env[name] = value;
            return 0; // why not return the value?
        case 'set!':
            name = expr[1];
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
            return expr[1];
        case '=':
            if (scheem.eval(expr[1], env) === scheem.eval(expr[2], env)) {
                return '#t';
            }
            return '#f';
        case '<':
            if (scheem.eval(expr[1], env) < scheem.eval(expr[2], env)) {
                return '#t';
            }
            return '#f';
        case 'cons':
            element = scheem.eval(expr[1], env);
            list = scheem.eval(expr[2], env);
            list.splice(0, 0, element);
            return list;
        case 'car':
            result = scheem.eval(expr[1], env)[0];
            return result;
        case 'cdr':
            list = scheem.eval(expr[1], env);
            list.splice(0, 1);
            return list;
        case 'if':
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
