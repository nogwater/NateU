var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('my.peg', 'utf-8');
// Show the PEG grammar file
console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// Do a test

// Simple list
assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );

// Extra trailing whitespace
assert.deepEqual( parse("(a  b  (c ) ) "), ["a", "b", ["c"]] );

// Extra leading whitespace
assert.deepEqual( parse(" (a  b  (  c ) ) "), ["a", "b", ["c"]] );

// Quote
assert.deepEqual( parse("'(1 2 3)"), parse("(quote (1 2 3))") );

console.log("-----------------------");
console.log("PASS");