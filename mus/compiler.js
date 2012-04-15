
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

// converts a note (like 'c4') to MIDI note numbers (like 60)
var noteToMIDI = function (note) {
	note = note.toLowerCase();
	var letter = note[0];
	var letterPitch = {c:0, d:2, e:4, f:5, g:7, a:9, b:11}[letter]
	var octave = parseInt(note[1]);
	return 12 + 12 * octave + letterPitch;
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
