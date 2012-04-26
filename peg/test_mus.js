var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('mus.peg', 'utf-8');
// Show the PEG grammar file
//console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// Do tests

assert.deepEqual( parse("a4", "pitch"), "a4", "single pitch")


//console.log(parse("play a4 for 150"));
assert.deepEqual( parse("play a4 for 150"), { tag: 'note', pitch: 'a4', dur: 150 }, "Play command");

//console.log(parse("play a4 for 250\nplay c4 for 500"));
assert.deepEqual( parse("play a4 for 250\nplay c4 for 500"), { tag: 'seq',
  left: { tag: 'note', pitch: 'a4', dur: 250 },
  right: { tag: 'note', pitch: 'c4', dur: 500 } }, "Sequence of notes");

// console.log(parse("rest for 150"));
assert.deepEqual( parse("rest for 150"), { tag: 'rest', duration:150 }, "Rest a bit");

// console.log(parse("together ( play a4 for 150 play c4 for 150 )"));
assert.deepEqual(parse("together ( play a4 for 150 play c4 for 150 )"), { tag: 'par',
  left: { tag: 'note', pitch: 'a4', dur: 150 },
  right: { tag: 'note', pitch: 'c4', dur: 150 } }, "Two notes together")

// console.log(parse("5 times ( play a4 for 150 rest for 150 )"));
assert.deepEqual(parse("5 times ( play a4 for 150 rest for 150 )"), { tag: 'repeat',
  section: 
   { tag: 'seq',
     left: { tag: 'note', pitch: 'a4', dur: 150 },
     right: { tag: 'rest', duration: 150 } },
  count: 5 }, "Repeat a sequence five times");


// console.log(parse("play a4 for 150 rest for 150 play a4 for 150 rest for 150 play a4 for 150"), "five commands in a row");