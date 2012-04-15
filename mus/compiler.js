
// MUS compiler for PL101

// calculates the end time for a given expression and start time
var endTime = function (time, expr) {
    if (expr.tag === 'rest') {
    	return time + expr.dur;
    } else if (expr.tag === 'note') {
        return time + expr.dur;
    } else if (expr.tag === 'seq') {
        return time + endTime(0, expr.left) + endTime(0, expr.right);
    } else if (expr.tag === 'par') {
        var durLeft = endTime(0, expr.left);
        var durRight = endTime(0, expr.right);
        return time + Math.max(durLeft, durRight) ;
    }
};

var noteToMIDI = function (note) {
	note = note.toLowerCase();
	var letter = note[0];
	var letterPitch = {c:0, d:2, e:4, f:5, g:7, a:9, b:11}[letter]
	var octave = parseInt(note[1]);
	return 12 + 12 * octave + letterPitch;
};


var noteToMIDILookup = function (note) {
	note = note.toLowerCase();
	return {
		'a0':21, 'b0':23,
		'c1':24, 'd1':26, 'e1':28, 'f1':29, 'g1':31, 'a1':33, 'b1':35,
		'c2':36, 'd2':38, 'e2':40, 'f2':41, 'g2':43, 'a2':45, 'b2':47,
		'c3':48, 'd3':50, 'e3':52, 'f3':53, 'g3':55, 'a3':57, 'b3':59,
		'c4':60, 'd4':62, 'e4':64, 'f4':65, 'g4':67, 'a4':69, 'b4':71,
		'c5':72, 'd5':74, 'e5':76, 'f5':77, 'g5':79, 'a5':81, 'b5':83,
		'c6':84, 'd6':86, 'e6':88, 'f6':89, 'g6':91, 'a6':93, 'b6':95,
		'c7':96, 'd7':98, 'e7':100, 'f7':101, 'g7':103, 'a7':105, 'b7':107,
		'c8':108
	}[note];
};

// compiles the given musexpress (and optional startTime) into a NOTE program
var compile = function (musexpr, startTime) {
    if (!startTime) { startTime = 0; }
    var noteExpr = [];
    var noteRight, i;
    if (musexpr.tag === 'rest') {
    	// nothing to add
    } else if (musexpr.tag === 'note') {
        noteExpr.push({ tag: 'note', pitch: noteToMIDI(musexpr.pitch), start: startTime, dur: musexpr.dur });
    } else if (musexpr.tag === 'seq') {
        noteExpr = compile(musexpr.left, startTime);
        var durLeft = endTime(startTime, musexpr.left);
        noteRight = compile(musexpr.right, durLeft);
        for (i = 0; i < noteRight.length; i++) {
            noteExpr.push(noteRight[i]);
        }
    } else if (musexpr.tag === 'par') {
        noteExpr = compile(musexpr.left, startTime);
        noteRight = compile(musexpr.right, startTime);
        for (i = 0; i < noteRight.length; i++) {
            noteExpr.push(noteRight[i]);
        }
    }
    return noteExpr;
};


// some tests
var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log('melody_mus:');
console.log(melody_mus);

console.log('compiled:');
console.log(compile(melody_mus));

var testNoteToMIDI = function (note) {
	if (noteToMIDI(note) === noteToMIDILookup(note)) {
		console.log("PASS " + note);
	} else {
		console.log("FAIL " + note);
	}
}
testNoteToMIDI('a0');
testNoteToMIDI('D1');
testNoteToMIDI('e2');
testNoteToMIDI('c4');
testNoteToMIDI('b2');
testNoteToMIDI('f3');
testNoteToMIDI('g');
testNoteToMIDI('c8');