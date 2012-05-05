var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files
var scheem = require('./scheem.js'); // my scheem interpreter

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');
// Show the PEG grammar file
//console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// Do tests


assert.deepEqual( scheem.eval(['+', 5, ['*', 2, 3]], {}), 11, 'Basic math');

assert.deepEqual( scheem.eval(['+', 'x', 1], {'x': 5}), 6, 'Add with variable');

var env = {a: 2, b: 7};
var result = scheem.eval(['define', 'x', 5], env);
assert.deepEqual(env , {a: 2, b: 7, x: 5}, 'define a variable');
assert.deepEqual(result, 0, 'define result is 0')

var env = {a: 2, b: 7};
var result = scheem.eval(['set!', 'a', 3], env);
assert.deepEqual(env , {a: 3, b: 7}, 'set! a variable');
assert.deepEqual(result, 0, 'set! result is 0')

var prg = ['begin',
            ['define', 'x', 5],
            ['set!', 'x', ['+', 'x', 1]],
            ['+', 2, 'x']];
var env = {a: 1, b: 7};
var result = scheem.eval(prg, env);
assert.deepEqual(env, {a: 1, b: 7, x: 6}, 'Little program; env');
assert.deepEqual(result, 8, 'Little program; result');

var prg = ['set!', 'x', ['quote', [1, '#t']]]; // set x to the list [1, '#t']
var env = {'x': 0};
var result = scheem.eval(prg, env);
assert.deepEqual(env, {x: [1, '#t']}, 'Simple quote; env');
assert.deepEqual(result, 0, 'Simple quote; result');

var prg = ['=', 2, ['+', 1, 1]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, '#t', 'Equality check; true');

var prg = ['=', 1, ['+', 1, 1]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, '#f', 'Equality check; false');


var prg = ['<', 1, ['+', 1, 1]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, '#t', 'Less than check; true');

var prg = ['<', 2, ['+', 1, 1]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, '#f', 'Less than check; false');

var prg = ['cons', 1, ['quote', [2, 3]]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, [1, 2, 3], 'cons; number');

var prg = ['cons', ['quote', [1, 2]], ['quote', [3, 4]]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, [[1, 2], 3, 4], 'cons; list');

var prg = ['car', ['quote', [1, 2, 3]]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, 1, 'car [1,2,3] -> 1');

var prg = ['cdr', ['quote', [1, 2, 3]]];
var env = {};
var result = scheem.eval(prg, env);
assert.deepEqual(result, [2, 3], 'cdr [1,2,3] -> [2,3]');

var prg = ['if', ['<', 'x', 5], 0, 10];
var env = {x: 1};
var result = scheem.eval(prg, env);
assert.deepEqual(result, 0, 'x < 5 ? 0 : 10');

var prg = ['if', ['<', 'x', 5], 0, 10];
var env = {x: 6};
var result = scheem.eval(prg, env);
assert.deepEqual(result, 10, 'x < 5 ? 0 : 10');