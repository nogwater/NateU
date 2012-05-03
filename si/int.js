var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');
// Show the PEG grammar file
//console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// Do tests

var evalScheem = function (expr, env) {
    var name, value, i;
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
            return evalScheem(expr[1], env) + evalScheem(expr[2], env);
        case '-':
            return evalScheem(expr[1], env) - evalScheem(expr[2], env);
        case '*':
            return evalScheem(expr[1], env) * evalScheem(expr[2], env);
        case '/':
            return evalScheem(expr[1], env) / evalScheem(expr[2], env);
        case 'define':
            name = expr[1]; // might be cool to allow references (expressions that return strings?)
            value = evalScheem(expr[2], env);
            // should probably error if env[name] is NOT undefined
            env[name] = value;
            return 0; // why not return the value?
        case 'set!':
            name = expr[1];
            value = evalScheem(expr[2], env);
            // should probably error if env[name] is undefined
            env[name] = value;
            return 0; // why not return the value?
        case 'begin':
            result = 0; // what should this default to?
            for (i = 1; i < expr.length; i++) {
                result = evalScheem(expr[i], env);
            }
            return result;
        case 'quote':
            return expr[1];
    }
};

assert.deepEqual( evalScheem(['+', 5, ['*', 2, 3]], {}), 11, 'Basic math');

assert.deepEqual( evalScheem(['+', 'x', 1], {'x': 5}), 6, 'Add with variable');

var env = {a: 2, b: 7};
var result = evalScheem(['define', 'x', 5], env);
assert.deepEqual(env , {a: 2, b: 7, x: 5}, 'define a variable');
assert.deepEqual(result, 0, 'define result is 0')

var env = {a: 2, b: 7};
var result = evalScheem(['set!', 'a', 3], env);
assert.deepEqual(env , {a: 3, b: 7}, 'set! a variable');
assert.deepEqual(result, 0, 'set! result is 0')

var prg = ['begin',
            ['define', 'x', 5],
            ['set!', 'x', ['+', 'x', 1]],
            ['+', 2, 'x']];
var env = {a: 1, b: 7};
var result = evalScheem(prg, env);
assert.deepEqual(env, {a: 1, b: 7, x: 6}, 'Little program; env');
assert.deepEqual(result, 8, 'Little program; result');

var prg = ['set!', 'x', ['quote', [1, '#t']]]; // set x to the list [1, '#t']
var env = {};
var result = evalScheem(prg, env);
assert.deepEqual(env, {x: [1, '#t']}, 'Simple quote; env');
assert.deepEqual(result, 0, 'Simple quote; result');

var prg = ['=', 2, ['+', 1, 1]];
var env = {};
var result = evalScheem(prg, env);
assert.deepEqual(result, '#t', 'Equality check');



