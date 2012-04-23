var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');
// Show the PEG grammar file
console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// Do a test

// Simple stuff
assert.deepEqual( parse("a"), "a", "Single atom");
assert.deepEqual( parse("()"), [], "Empty list");
assert.deepEqual( parse("(a b c)"), ["a", "b", "c"], "Simple list");
assert.deepEqual( parse("(a () (1 2))"), ["a", [], [1, 2]], "Mixed list");

// Extra trailing whitespace
assert.deepEqual( parse("(a  b  	c )"), ["a", "b", "c"], "Trailing whitespace (atom)");
assert.deepEqual( parse("(a b c () )"), ["a", "b", "c", []], "Trailing whitespace (empty list)");
assert.deepEqual( parse("(a b c ) "), ["a", "b", "c"], "Trailing whitespace (non-empty list)");
assert.deepEqual( parse("(a b '(1 2)  )"), ['a', 'b', ['quote', ['1', '2']]], "Trailing whitespace (quote)2");

// Extra leading whitespace
assert.deepEqual( parse(" ( a  b  (  c ) ) "), ["a", "b", ["c"]], "Leading whitespace");

// Quote
assert.deepEqual( parse("'a"), parse("(quote a)"), "Atom quoting");
assert.deepEqual( parse("'(1 2 3)"), parse("(quote (1 2 3))"), "List quoting");

// Newline as whitespace
assert.deepEqual( parse("(a\nb\nc)"), ["a", "b", "c"], "Newline whitespace");

// Comment lines
// Note: ";;" must be the first character in the line to be a newline
// Technically ';' isn't allowed in atoms
//assert.deepEqual( parse("(keep;; ;; \n;; comment line\natom\n)"), ["keep;;", ";;", "atom"])
assert.deepEqual( parse("(keep \n;; comment line\natom\n)"), ["keep", "atom"])

console.log("-----------------------");
console.log("PASS");