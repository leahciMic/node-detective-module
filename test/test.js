var assert = require('assert');
var detective = require('../');

describe('detective-es6', function() {
  var ast = {
    type: 'Program',
    body: [{
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: {
            type: 'Identifier',
            name: 'x'
        },
        init: {
            type: 'Literal',
            value: 4,
            raw: '4'
        }
      }],
      kind: 'let'
    }]
  };

  it('accepts an ast', function() {
    var deps = detective(ast);
    assert(!deps.length);
  });

  it('retrieves the dependencies of es6 modules', function() {
    var deps = detective('import Abc, * as All from "mylib";');
    assert(deps.length === 1);
    assert(deps[0].name === 'mylib');
    assert(deps[0].star === true);
    assert(deps[0].alias === 'All');
    assert(deps[0].default === 'Abc');
  });

  it('retrieves the re-export dependencies of es6 modules', function() {
    var deps = detective('export {foo, bar} from "mylib";');
    assert(deps.length === 1);
    assert(deps[0].name === 'mylib');
    assert(deps[0].members.length === 2);
    assert(deps[0].members[0].name === 'foo');
    assert(deps[0].members[0].alias === 'foo');
    assert(deps[0].members[1].name === 'bar');
    assert(deps[0].members[1].alias === 'bar');
  });

  it('works with async functions', function() {
    var deps = detective('import foo from "foo"; async function test() {}');
    assert(deps.length === 1);
  });

  it('works with commonjs require expression', function() {
    var deps = detective('var a = require("foo");');
    assert(deps.length === 1);
    assert(deps[0].name === 'foo');
  });

  it('works with commonjs require', function() {
    var deps = detective('require("foo");');
    assert(deps.length === 1);
    assert(deps[0].name === 'foo');
  });

  it('ignores dynamic requires', function() {
    var deps = detective('require(blah);');
    assert(deps.length === 0);
  });

  it('retrieves the re-export dependencies alias of es6 modules', function() {
    var deps = detective('export {foo as Foo} from "mylib";');
    assert(deps.length === 1);
    assert(deps[0].name === 'mylib');
    assert(deps[0].members.length === 1);
    assert(deps[0].members[0].name === 'foo');
    assert(deps[0].members[0].alias === 'Foo');
  });

  it('retrieves the re-export * dependencies of es6 modules', function() {
    var deps = detective('export * from "mylib";');

    assert(deps.length === 1);
    assert(deps[0].name === 'mylib');
  });

  it('handles multiple imports', function() {
    var deps = detective('import {foo as Foo, bar} from "mylib";\nimport "mylib2"');

    assert(deps.length === 2);
    assert(deps[0].name === 'mylib');
    assert(deps[0].members.length === 2);
    assert(deps[0].members[0].name === 'foo');
    assert(deps[0].members[0].alias === 'Foo');
    assert(deps[0].members[1].name === 'bar');
    assert(deps[0].members[1].alias === 'bar');
    assert(deps[1].name === 'mylib2');
  });

  it('handles default imports', function() {
    var deps = detective('import foo from "foo";');

    assert(deps.length === 1);
    assert(deps[0].name === 'foo');
    assert(deps[0].default === 'foo');
  });

  it('does not throw with jsx in a module', function() {
    assert.doesNotThrow(function() {
      detective('import foo from "foo"; var templ = <jsx />;');
    });
  });

  it('does not throw on an async ES7 function', function() {
    assert.doesNotThrow(function() {
      detective('import foo from "foo"; export default async function foo() {}');
    });
  });
});
