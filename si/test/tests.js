
// Test cases for scheem parser and interpreter.
// Can be run from a web page or node.js.


if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var PEG = require('pegjs');
    var fs = require('fs');
    var scheem = require('../scheem');
    scheem.parse = PEG.buildParser(fs.readFileSync('scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var assert = chai.assert;
}



suite('add', function() {
    test('two plus two', function() {
        assert.deepEqual(
            scheem.eval(['+', 2, 2]),
            4
        );
    });
    test('two numbers', function() {
        assert.deepEqual(
            scheem.eval(['+', 3, 5]),
            8
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            scheem.eval(['+', 3, ['+', 2, 2]]),
            7
        );
    });
    test('lots of numbers', function () {
        assert.deepEqual(
            scheem.eval(['+', 1, 2, 3, 4, 5]),
            15
        );
    });
    test('Error: a dog and a cat', function() {
        assert.throws(function () {
            scheem.eval(['+', 'dog', 'cat']);
        });
    });
});
suite('subtract', function () {
    test('one number', function () {
        assert.deepEqual(
            scheem.eval(['-', 5])
            , 5
        );
    });
    test('two numbers', function () {
        assert.deepEqual(
            scheem.eval(['-', 5, 1])
            , 4
        );
    });
    test('two expressions', function () {
        assert.deepEqual(
            scheem.eval(['-', ['-', 1, 1], ['-', 1, 0]])
            , -1
        );
    });
    test('Error: not enough parameters', function() {
        assert.throws(function () {
            scheem.eval(['-']);
        });
    });
});
suite('multiplication', function () {
    test('one number', function () {
        assert.deepEqual(
            scheem.eval(['*', 3])
            , 3
        );
    });
    test('two numbers', function () {
        assert.deepEqual(
            scheem.eval(['*', 3, 4])
            , 12
        );
    });
    test('two expressions', function () {
        assert.deepEqual(
            scheem.eval(['*', ['*', 3, 3], ['*', 3, 3]])
            , 81
        );
    });
});
suite('division', function () {
    test('two numbers', function () {
        assert.deepEqual(
            scheem.eval(['/', 3, 4])
            , 0.75
        );
    });
    test('two expressions', function () {
        assert.deepEqual(
            scheem.eval(['/', ['/', 3, 1], ['/', 9, 3]])
            , 1
        );
    });
    test('Error: not enough parameters', function() {
        assert.throws(function () {
            scheem.eval(['/']);
        });
    });
    test('Error: divide by zero', function() {
        assert.throws(function () {
            scheem.eval(['/', 1, 0]);
        });
    });
});
suite('variable', function () {
    test('definition', function () {
        var result = scheem.eval(['begin', ['define', 'x', 5], 'x']);
        assert.deepEqual(result, 5);
    });
    test('Error: redefining', function () {
        assert.throws(function () {
            var env = { bindings: {'x': 5}, outer: null };
            scheem.eval(['define', 'x', 5], env);
        });
    });
    test('Error: redefining 2', function () {
        assert.throws(function () {
            scheem.eval(['begin', ['define', 'x', 5], ['define', 'x', 1]]);
        });
    });
    test('setting', function () {
        var result = scheem.eval(['begin', ['define', 'x', 1], ['set!', 'x', 5], 'x']);
        assert.deepEqual(result, 5);
    });
    test('Error: setting when undefined', function () {
        assert.throws(function () {
            scheem.eval(['set!', 'x', 5]);
        });
    });
    test('shadowing', function () {
        var result = scheem.eval(['begin', ['define', 'x', 1], ['let', 'x', 2, 'x']]);
        assert.deepEqual(result, 2);
    });
    test('double shadowing', function () {
        var result = scheem.eval(['begin', ['define', 'x', 1], ['define', 'y', 1], ['let', 'x', 2, 'y', 3, 'y']]);
        assert.deepEqual(result, 3);
    });
    test('un-shadowing', function () {
        var result = scheem.eval(['begin', ['define', 'x', 1], ['let', 'x', 2, ['+', 'x', 0]], 'x']);
        assert.deepEqual(result, 1);
    });
});
suite('blocks', function () {
    test('empty block', function () {
        var result = scheem.eval(['begin']);
        assert.deepEqual(result, 0);
    });
    test('single expression block', function () {
        var result = scheem.eval(['begin', ['+', 1, 2]]);
        assert.deepEqual(result, 3);
    });
    test('multiple expression block', function () {
        var result = scheem.eval(['begin', ['define', 'x', 5], ['+', 'x', 2]]);
        assert.deepEqual(result, 7);
    });
});
suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            scheem.eval(['quote', 3]),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            scheem.eval(['quote', 'dog']),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            scheem.eval(['quote', [1, 2, 3]]),
            [1, 2, 3]
        );
    });
    test('Error: not enough parameters', function() {
        assert.throws(function () {
            scheem.eval(['quote']);
        });
    });
    test('Error: too many parameters', function() {
        assert.throws(function () {
            scheem.eval(['quote', 1, 2]);
        });
    });
});
suite('compare', function () {
    test('equality of 1 and 1', function () {
        var result = scheem.eval(['=', 1, 1]);
        assert.deepEqual(result, '#t');
    });
    test('inequality of 1 and 2', function () {
        var result = scheem.eval(['=', 1, 2]);
        assert.deepEqual(result, '#f');
    });
    test('equality of 3 and 3 and 3', function () {
        var result = scheem.eval(['=', 3, 3, 3]);
        assert.deepEqual(result, '#t');
    });
    test('equality of expressions', function () {
        var result = scheem.eval(['=', ['+', 1, 1], ['/', 16, 8]]);
        assert.deepEqual(result, '#t');
    });
    test('equality of variables', function () {
        var result = scheem.eval(['begin', ['define', 'x', 5], ['define', 'y', 5], ['=', 'x', 'y']]);
        assert.deepEqual(result, '#t');
    });
    test('5 is less than 6', function () {
        var result = scheem.eval(['<', 5, 6]);
        assert.deepEqual(result, '#t');
    });
    test('7 < 8 < 9', function () {
        var result = scheem.eval(['<', 7, 8, 9]);
        assert.deepEqual(result, '#t');
    });
    test('4 is NOT less than 4', function () {
        var result = scheem.eval(['<', 4, 4]);
        assert.deepEqual(result, '#f');
    });
    test('variable is less than expression', function () {
        var result = scheem.eval(['begin', ['define', 'x', -1], ['<', 'x', ['*', 1, 2]]]);
        assert.deepEqual(result, '#t');
    });
});
suite('list manipulation', function () {
    test('get first element', function () {
        var result = scheem.eval(['car', ['quote', [1, 2, 3]]]);
        assert.deepEqual(result, 1);
    });
    test('get tail', function () {
        var result = scheem.eval(['cdr', ['quote', [1, 2, 3]]]);
        assert.deepEqual(result, [2, 3]);
    });
    test('concatenate', function () {
        var result = scheem.eval(['cons', 1, ['quote', [2, 3]]]);
        assert.deepEqual(result, [1, 2, 3]);
    });
    test('cons car cdr', function () {
        var result = scheem.eval(['begin'
                            , ['define', 'x', ['quote', [1, 2, 3]]]
                            , ['cons', ['car', 'x'], ['cdr', 'x']]
                            ]);
        assert.deepEqual(result, [1, 2, 3]);
    });
    test('Error: cons with non-list', function () {
        assert.throws(function () {
            scheem.eval(['cons', 1, 2]);
        });
    });
    test('Error: car on non-list', function () {
        assert.throws(function () {
            scheem.eval(['car', 1]);
        });
    });
    test('Error: cdr on non-list', function () {
        assert.throws(function () {
            scheem.eval(['cdr', 1]);
        });
    });
});
suite('conditional', function () {
    test('if true', function () {
        var result = scheem.eval(['if', ['quote', '#t'], 1, 2]);
        assert.deepEqual(result, 1);
    });
    test('if false', function () {
        var result = scheem.eval(['if', ['quote', '#f'], 1, 2]);
        assert.deepEqual(result, 2);
    });
    test('define when true', function () {
        var result = scheem.eval(['begin', ['if', ['=', 1, 1], ['define', 'x', 1], ['define', 'y', 2]], 'x']);
        assert.deepEqual(result, 1);
    });
    test('define when false', function () {
        var result = scheem.eval(['begin', ['if', ['=', 1, 2], ['define', 'x', 1], ['define', 'y', 2]], 'y']);
        assert.deepEqual(result, 2);
    });
    test('Error: not enough parameters for if', function () {
        assert.throws(function () {
            scheem.eval(['if', ['quote', '#t'], 1]);
        });
    });
    test('Error: too many parameters for if', function () {
        assert.throws(function () {
            scheem.eval(['if', ['quote', '#t'], 1, 2, 3]);
        });
    });
});

suite('parse', function () {
    test('a number', function () {
        assert.deepEqual(
            scheem.parse('42')
            , 42
        );
    });
    test('a variable', function () {
        assert.deepEqual(
            scheem.parse('x')
            , 'x'
        );
    });
    test('an empty list', function () {
        assert.deepEqual(
            scheem.parse('()')
            , []
        );
    });
    test('a list of atoms', function () {
        assert.deepEqual(
            scheem.parse("(a b c)")
            , ['a', 'b', 'c']
        );
    });
    test('a list of numbers', function () {
        assert.deepEqual(
            scheem.parse("(1 2 3)")
            , [1, 2, 3]
        );
    });
    test('a little math', function () {
        assert.deepEqual(
            scheem.parse("(+ 2 (* 3 4))")
            , ['+', 2, ['*', 3, 4]]
        );
    });
    test('a quoted atom', function () {
        assert.deepEqual(
            scheem.parse("'#t")
            , ['quote', '#t']
        );
    });
    test('a quoted list', function () {
        assert.deepEqual(
            scheem.parse("'(1 2)")
            , ['quote', [1, 2]]
        );
    });
});

suite('evaluate string', function () {
    test('a number', function () {
        assert.deepEqual(
            scheem.evalString("42")
            , 42
        );
    });
    test('a little math', function () {
        assert.deepEqual(
            scheem.evalString("(+ 2 (* 3 4))")
            , 14
        );
    });
    test('the works (define, set, add)', function () {
        var result = scheem.evalString("(begin (define x 1) (define y 2) (set! x y) (+ y x))");
        assert.deepEqual(
            result
            , 4
        );
    });
});

suite('function application', function () {
    test('double x (l-1)', function () {
        var result = scheem.eval([
                'begin', 
                ['define', 'double', [
                    'lambda', 'x', ['+', 'x', 'x']
                ]], 
                ['double', 5]]
            );
        assert.deepEqual(result, 10);
    });
    test('factorial x (l-1)', function () {
        var result = scheem.eval([
                'begin', 
                ['define', 'factorial', [
                    'lambda', 'x', [
                        'if', ['=', 'x', 0]
                            , 1
                            , ['*', 'x', ['factorial', ['-', 'x', 1]]]
                    ]
                ]], 
                ['factorial', 5]]
            );
        assert.deepEqual(result, 120);
    });
    test('always-three', function () {
        var result = scheem.eval([
                'begin', 
                ['define', 'always-three', [
                    'lambda', 3
                ]], 
                ['always-three', 5]]
            );
        assert.deepEqual(result, 3);
    });
    test('double x', function () {
        var result = scheem.eval([
                'begin', 
                ['define', 'double', [
                    'lambda', 'x', ['+', 'x', 'x']
                ]], 
                ['double', 5]]
            );
        assert.deepEqual(result, 10);
    });
    test('factorial x', function () {
        var result = scheem.eval([
                'begin', 
                ['define', 'factorial', [
                    'lambda', 'x', [
                        'if', ['=', 'x', 0]
                            , 1
                            , ['*', 'x', ['factorial', ['-', 'x', 1]]]
                    ]
                ]], 
                ['factorial', 5]]
            );
        assert.deepEqual(result, 120);
    });
    test('call anonymouse square', function () {
        var result = scheem.eval([['lambda', 'x', ['*', 'x', 'x']], 4], {});
        assert.deepEqual(result, 16);
    });
    test('scheem call anonymouse square', function () {
        var result = scheem.evalString("((lambda x (* x x)) 4)", {});
        assert.deepEqual(result, 16);
    });    
});

suite('alert', function () {
    test('say hello', function () {
        scheem.eval(['alert', ['quote', 'hello']]);
    });
    test('hello from evalString', function () {
        scheem.evalString("(alert 'hello-world)");
    });

});