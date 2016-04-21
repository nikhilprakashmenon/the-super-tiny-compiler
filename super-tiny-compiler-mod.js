/**
 * ============================================================================
 *                                   (/^▽^)/
 *                                THE TOKENIZER!
 * ============================================================================
 */

// We start by accepting an input string of code, and we're gonna set up two
// things...
function tokenizer(input) {

  // A `current` variable for tracking our position in the code like a cursor.
  var current = 0;

  // And a `tokens` array for pushing our tokens to.
  var tokens = [];

  // We start by creating a `while` loop where we are setting up our `current`
  // variable to be incremented as much as we want `inside` the loop.
  //
  // We do this because we may want to increment `current` many times within a
  // single loop because our tokens can be any length.
  while (current < input.length) {

    // We're also going to store the `current` character in the `input`.
    var char = input[current];

    // The first thing we want to check for is an open parenthesis. This will
    // later be used for `CallExpressions` but for now we only care about the
    // character.
    //
    // We check to see if we have an open parenthesis:
    if (char === '(') {

      // If we do, we push a new token with the type `paren` and set the value
      // to an open parenthesis.
      tokens.push({
        type: 'paren',
        value: '('
      });

      // Then we increment `current`
      current++;

      // And we `continue` onto the next cycle of the loop.
      continue;
    }

    // Next we're going to check for a closing parenthesis. We do the same exact
    // thing as before: Check for a closing parenthesis, add a new token,
    // increment `current`, and `continue`.
    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')'
      });
      current++;
      continue;
    }

    // Moving on, we're now going to check for whitespace. This is interesting
    // because we care that whitespace exists to separate characters, but it
    // isn't actually important for us to store as a token. We would only throw
    // it out later.
    //
    // So here we're just going to test for existence and if it does exist we're
    // going to just `continue` on.
    var WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    // The next type of token is a number. This is different than what we have
    // seen before because a number could be any number of characters and we
    // want to capture the entire sequence of characters as one token.
    //
    //   (add 123 456)
    //        ^^^ ^^^
    //        Only two separate tokens
    //
    // So we start this off when we encounter the first number in a sequence.
    var NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {

      // We're going to create a `value` string that we are going to push
      // characters to.
      var value = '';

      // Then we're going to loop through each character in the sequence until
      // we encounter a character that is not a number, pushing each character
      // that is a number to our `value` and incrementing `current` as we go.
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }


      // After that we push our `number` token to the `tokens` array.
      tokens.push({
        type: 'number',
        value: value
      });

      // And we continue on.
      continue;
    }

    // The last type of token will be a `name` token. This is a sequence of
    // letters instead of numbers, that are the names of functions in our lisp
    // syntax.
    //
    //   (add 2 4)
    //    ^^^
    //    Name token
    //
    var LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      var value = '';

      // Again we're just going to loop through all the letters pushing them to
      // a value.
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      var keywords = ['defvar', 'if', 'define', 'write-line'];

      // check for keyword
      if (keywords.indexOf(value)  
      	in keywords) {

      	tokens.push({
          type: 'keyword',
          value: value
      });
        continue;
      }

      // And pushing that value as a token with the type `name` and continuing.
      tokens.push({
        type: 'name',
        value: value
      });

      continue;
    }

    // Check for arithmetic operators 
    var OPERATORS = /\+|\-|\*|\//;
    if(OPERATORS.test(char)) {
      tokens.push({
      	type: 'oper',
      	value: char
      });
      current++;
      continue;
    }

    // Check for conditional operators
    var CONDOPERATORS = /^<$|^>$|^=$/;
    if(CONDOPERATORS.test(char)) {
      tokens.push({
        type: 'condoper',
        value: char
      });
      current++;
      continue;
    }

    // Finally if we have not matched a character by now, we're going to throw
    // an error and completely exit.
    throw new TypeError('I dont know what this character is: ' + char);
  }

  // Then at the end of our `tokenizer` we simply return the tokens array.
  return tokens;
}

/**
 * ============================================================================
 *                                 ヽ/❀o ل͜ o\ﾉ
 *                                THE PARSER!!!
 * ============================================================================
 */

/**
 * For our parser we're going to take our array of tokens and turn it into an
 * AST.
 *
 *   [{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
 */

// Okay, so we define a `parser` function that accepts our array of `tokens`.
function parser(tokens) {

  // Again we keep a `current` variable that we will use as a cursor.
  var current = 0;

  // But this time we're going to use recursion instead of a `while` loop. So we
  // define a `walk` function.
  function walk() {
  	
    // Inside the walk function we start by grabbing the `current` token.
    var token = tokens[current];

    // We're going to split each type of token off into a different code path,
    // starting off with `number` tokens.
    //
    // We test to see if we have a `number` token.
    if (token.type === 'number') {

      // If we have one, we'll increment `current`.
      current++;

      // And we'll return a new AST node called `NumberLiteral` and setting its
      // value to the value of our token.
      return {
        type: 'NumberLiteral',
        value: token.value
      };
    }

    if (token.type === 'name') {
      current++;

      return {
      	type: 'StringLiteral',
      	value: token.value
      };
    }

    // Next we're going to look for CallExpressions / Expressions. We start this off when we
    // encounter an open parenthesis.
    if (
      token.type === 'paren' &&
      token.value === '('
    ) {

      // We'll increment `current` to skip the parenthesis since we don't care
      // about it in our AST.
      token = tokens[++current];

      // We create a base node with the type `CallExpression` or `BinaryExpression` depending on the type of 
      // next token
      var node;

      // We look ahead and check the type of operation (Procedure call or an expression)
      switch(token.type){

        case 'name':
	      node = {
	        type: 'CallExpression',
	        name: token.value,
	        params: []
	      };
	      break;

	    case 'oper':
	    
	    case 'condoper':
	      node = {
	        type: 'BinaryExpression',
	        operator: token.value,
	        params: []
	      };
	      break;

      	case 'keyword': 

      	  var keywordStruct = {

   		    'defvar' : {
	          type: 'VariableDeclarator',
	          name: tokens[current+1].value,
	          params: []
   		    },

   		    'if' : {
   		      type: 'IfStatement',
   		      test: [],
   		      conseq: [],
   		      alt: [],
   		    },

      	  };

      	  node = keywordStruct[token.value];
      	  token = tokens[++current];		  
	      break;
      }

      // We increment `current` *again* to skip the name token only when the type is not an if statement
      // to handle conditional operator.
      if(node.type !== 'IfStatement')
     	 token = tokens[++current];

      // And now we want to loop through each token that will be the `params` of
      // our `CallExpression` until we encounter a closing parenthesis.
      //
      // Now this is where recursion comes in. Instead of trying to parse a
      // potentially infinitely nested set of nodes we're going to rely on
      // recursion to resolve things.
      //
      // To explain this, let's take our Lisp code. You can see that the
      // parameters of the `add` are a number and a nested `CallExpression` that
      // includes its own numbers.
      //
      //   (add 2 (subtract 4 2))
      //
      // You'll also notice that in our tokens array we have multiple closing
      // parenthesis.
      //
      //   [
      //     { type: 'paren',  value: '('        },
      //     { type: 'name',   value: 'add'      },
      //     { type: 'number', value: '2'        },
      //     { type: 'paren',  value: '('        },
      //     { type: 'name',   value: 'subtract' },
      //     { type: 'number', value: '4'        },
      //     { type: 'number', value: '2'        },
      //     { type: 'paren',  value: ')'        }, <<< Closing parenthesis
      //     { type: 'paren',  value: ')'        }  <<< Closing parenthesis
      //   ]
      //
      // We're going to rely on the nested `walk` function to increment our
      // `current` variable past any nested `CallExpressions`.

      // So we create a `while` loop that will continue until it encounters a
      // token with a `type` of `'paren'` and a `value` of a closing
      // parenthesis.
      while (
        (token.type !== 'paren') ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        // we'll call the `walk` function which will return a `node` and we'll
        // push it into our `node.params`.
        

        if(node.type === 'IfStatement') {

          node.test.push(walk());
          node.conseq.push(walk());
          node.alt.push(walk());

        }
        else{
		  node.params.push(walk());
        }

        token = tokens[current];
      }

      // Finally we will increment `current` one last time to skip the closing
      // parenthesis.
      current++;

      // And return the node.
      return node;
    }

    // Again, if we haven't recognized the token type by now we're going to
    // throw an error.
    throw new TypeError("Error: " + token.type );
  }

  // Now, we're going to create our AST which will have a root which is a
  // `Program` node.
  var ast = {
    type: 'Program',
    body: []
  };

  // And we're going to kickstart our `walk` function, pushing nodes to our
  // `ast.body` array.
  //
  // The reason we are doing this inside a loop is because our program can have
  // `CallExpressions` after one another instead of being nested.
  //
  //   (add 2 2)
  //   (subtract 4 2)
  //
  while (current < tokens.length) {
    ast.body.push(walk());
  }

  // At the end of our parser we'll return the AST.
  return ast;
}

/**
 * ============================================================================
 *                                 ⌒(❀>◞౪◟<❀)⌒
 *                               THE TRAVERSER!!!
 * ============================================================================
 */

/**
 * So now we have our AST, and we want to be able to visit different nodes with
 * a visitor. We need to be able to call the methods on the visitor whenever we
 * encounter a node with a matching type.
 *

var visitor = {

    // The first visitor method accepts `NumberLiterals`
    NumberLiteral: function(node, parent) {
      // We'll create a new node also named `NumberLiteral` that we will push to
      // the parent context.parent._context.push(declaration);
      parent._context.push({
        type: 'NumberLiteral',
        value: node.value
      });
    },

    // Next up, `CallExpressions`.
    CallExpression: function(node, parent) {

      // We start creating a new node `CallExpression` with a nested
      // `Identifier`.
      var expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name
        },
        arguments: []
      };

      // Next we're going to define a new context on the original
      // `CallExpression` node that will reference the `expression`'s arguments
      // so that we can push arguments.
      node._context = expression.arguments;

      // Then we're going to check if the parent node is a `CallExpression`.
      // If it is not...
      if (parent.type !== 'CallExpression') {

        // We're going to wrap our `CallExpression` node with an
        // `ExpressionStatement`. We do this because the top level
        // `CallExpressions` in JavaScript are actually statements.
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        };
      }

      // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
      // `context`.
      parent._context.push(expression);
    }
  }
 */

// So we define a traverser function which accepts an AST and a
// visitor. Inside we're going to define two functions...
function traverser(ast, visitor) {

  // A `traverseArray` function that will allow us to iterate over an array and
  // call the next function that we will define: `traverseNode`.
  function traverseArray(array, parent) {
    array.forEach(function(child) {
      traverseNode(child, parent);
    });
  }

  // `traverseNode` will accept a `node` and its `parent` node. So that it can
  // pass both to our visitor methods.
  function traverseNode(node, parent) {

    // We start by testing for the existence of a method on the visitor with a
    // matching `type`.
    var method = visitor[node.type];

    // If it exists we'll call it with the `node` and its `parent`.
    if (method) {
      method(node, parent);
    }

    // Next we are going to split things up by the current node type.
    switch (node.type) {

      // We'll start with our top level `Program`. Since Program nodes have a
      // property named body that has an array of nodes, we will call
      // `traverseArray` to traverse down into them.
      //
      // (Remember that `traverseArray` will in turn call `traverseNode` so  we
      // are causing the tree to be traversed recursively)
      case 'Program':
        traverseArray(node.body, node);
        break;

      // Next we do the same with `CallExpressions` and traverse their `params`.
      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      case 'BinaryExpression':
      	traverseArray(node.params, node);
      	break;

      case 'VariableDeclarator':
        traverseArray(node.params, node);
        break;

      case 'IfStatement':
        traverseArray(node.test, node);     
        traverseArray(node.conseq, node);        
        traverseArray(node.alt, node);
        break;

      // In the case of `NumberLiterals` we don't have any child nodes to visit,
      // so we'll just break.
      case 'NumberLiteral':
        break;

      case 'StringLiteral':
        break;

      // And again, if we haven't recognized the node type then we'll throw an
      // error.
      default:
        throw new TypeError(node.type);
    }
  }

  // Finally we kickstart the traverser by calling `traverseNode` with our ast
  // with no `parent` because the top level of the AST doesn't have a parent.
  traverseNode(ast, null);
}

/**
 * ============================================================================
 *                                   ⁽(◍˃̵͈̑ᴗ˂̵͈̑)⁽
 *                              THE TRANSFORMER!!!
 * ============================================================================
 */

/**
 * Next up, the transformer. Our transformer is going to take the AST that we
 * have built and pass it to our traverser function with a visitor and will
 * create a new ast.
 *
 * ----------------------------------------------------------------------------
 *   Original AST                     |   Transformed AST
 * ----------------------------------------------------------------------------
 *   {                                |   {
 *     type: 'Program',               |     type: 'Program',
 *     body: [{                       |     body: [{
 *       type: 'CallExpression',      |       type: 'ExpressionStatement',
 *       name: 'add',                 |       expression: {
 *       params: [{                   |         type: 'CallExpression',
 *         type: 'NumberLiteral',     |         callee: {
 *         value: '2'                 |           type: 'Identifier',
 *       }, {                         |           name: 'add'
 *         type: 'CallExpression',    |         },
 *         name: 'subtract',          |         arguments: [{
 *         params: [{                 |           type: 'NumberLiteral',
 *           type: 'NumberLiteral',   |           value: '2'
 *           value: '4'               |         }, {
 *         }, {                       |           type: 'CallExpression',
 *           type: 'NumberLiteral',   |           callee: {
 *           value: '2'               |             type: 'Identifier',
 *         }]                         |             name: 'subtract'
 *       }]                           |           },
 *     }]                             |           arguments: [{
 *   }                                |             type: 'NumberLiteral',
 *                                    |             value: '4'
 * ---------------------------------- |           }, {
 *                                    |             type: 'NumberLiteral',
 *                                    |             value: '2'
 *                                    |           }]
 *  (sorry the other one is longer.)  |         }
 *                                    |       }
 *                                    |     }]
 *                                    |   }
 * ----------------------------------------------------------------------------
 */

// So we have our transformer function which will accept the lisp ast.
function transformer(ast) {

  // We'll create a `newAst` which like our previous AST will have a program
  // node.
  var newAst = {
    type: 'Program',
    body: []
  };

  // Next I'm going to cheat a little and create a bit of a hack. We're going to
  // use a property named `context` on our parent nodes that we're going to push
  // nodes to their parent's `context`. Normally you would have a better
  // abstraction than this, but for our purposes this keeps things simple.
  //
  // Just take note that the context is a reference *from* the old ast *to* the
  // new ast.
  ast._context = newAst.body;

  // We'll start by calling the traverser function with our ast and a visitor.
  traverser(ast, {

    // The first visitor method accepts `NumberLiterals`
    NumberLiteral: function(node, parent) {
      // We'll create a new node also named `NumberLiteral` that we will push to
      // the parent context.
      parent._context.push({
        type: 'NumberLiteral',
        value: node.value
      });
    },

    StringLiteral: function(node, parent) {
      
      parent._context.push({
        type: 'StringLiteral',
        value: node.value
      });      
    },

    // Next up, `CallExpressions`.
    CallExpression: function(node, parent) {

      // We start creating a new node `CallExpression` with a nested
      // `Identifier`.
      var expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name
        },
        arguments: []
      };

      // Next we're going to define a new context on the original
      // `CallExpression` node that will reference the `expression`'s arguments
      // so that we can push arguments.
      node._context = expression.arguments;

      // Then we're going to check if the parent node is a `CallExpression`.
      // If it is not...
      if (parent.type !== 'CallExpression') {

        // We're going to wrap our `CallExpression` node with an
        // `ExpressionStatement`. We do this because the top level
        // `CallExpressions` in JavaScript are actually statements.
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        };
      }

      // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
      // `context`.
      parent._context.push(expression);
    },

	// Next up, `BinaryExpressions`.
    BinaryExpression: function(node, parent){

      var expression = {
      	type: 'BinaryExpression',
      	operation: {
      	  type: 'Operator',
      	  value: (node.operator == '=') ? '==' : node.operator
      	},
      	arguments: []
      };

      node._context = expression.arguments;

      // Then we're going to check if the parent node is a `BinaryExpression`.
      // If it is not...
      if (parent.type !== 'BinaryExpression' 
      	&& parent.type !== 'VariableDeclarator'
      	&& parent.type !== 'IfStatement') {

        // We're going to wrap our `CallExpression` node with an
        // `ExpressionStatement`. We do this because the top level
        // `CallExpressions` in JavaScript are actually statements.
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        };
      }

      // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
      // `context`.
      parent._context.push(expression);   
    },

    IfStatement: function(node, parent) {

      var statement = {

  	    type: 'IfStatement',
  	    body: []
      };

      node._context = statement.body;

      if (parent.type !== 'IfStatement') {

        // We're going to wrap our `CallExpression` node with an
        // `ExpressionStatement`. We do this because the top level
        // `CallExpressions` in JavaScript are actually statements.
        statement = {
          type: 'ExpressionStatement',
          expression: statement
        };
      }

      parent._context.push(statement);
    },

    VariableDeclarator: function(node, parent) {

      var declaration = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: node.name
        },
        init: []
      };

      node._context = declaration.init;

      // Then we're going to check if the parent node is a `BinaryExpression`.
      // If it is not...
      if (parent.type !== 'VariableDeclarator') {

        // We're going to wrap our `CallExpression` node with an
        // `ExpressionStatement`. We do this because the top level
        // `CallExpressions` in JavaScript are actually statements.
        declaration = {
          type: 'ExpressionStatement',
          expression: declaration
        };
      }

      // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
      // `context`.
      parent._context.push(declaration);
    },

  });

  // At the end of our transformer function we'll return the new ast that we
  // just created.
  return newAst;
}

/**
 * ============================================================================
 *                               ヾ（〃＾∇＾）ﾉ♪
 *                            THE CODE GENERATOR!!!!
 * ============================================================================
 */

/**
 * Now let's move onto our last phase: The Code Generator.
 *
 * Our code generator is going to recursively call itself to print each node in
 * the tree into one giant string.
 */

function codeGenerator(node) {

  // We'll break things down by the `type` of the `node`.
  switch (node.type) {

    // If we have a `Program` node. We will map through each node in the `body`
    // and run them through the code generator and join them with a newline.
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');

    // For `ExpressionStatements` we'll call the code generator on the nested
    // expression and we'll add a semicolon...
    case 'ExpressionStatement':
      return (
        codeGenerator(node.expression) +
        ';' // << (...because we like to code the *correct* way)
      );

    // For `CallExpressions` we will print the `callee`, add an open
    // parenthesis, we'll map through each node in the `arguments` array and run
    // them through the code generator, joining them with a comma, and then
    // we'll add a closing parenthesis.
    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );

    case 'BinaryExpression':
      return (
      	'(' +
      	node.arguments.map(codeGenerator)
      	.join(' ' + codeGenerator(node.operation) + ' ') +
      	')'
      );

    case 'VariableDeclarator':
      var result = '';
      var value = node.init[0];
      if(value.type == 'StringLiteral')
      	result += "char *" + codeGenerator(node.id) + " = \"" + codeGenerator(value) + "\"";
      else
       	result += "int " + codeGenerator(node.id) + " = " + codeGenerator(value);
      return result;


    case 'IfStatement':
      var elseCase ='';
      var ifCase = ''
      // If there is an else case
      if(node.body[2]) {
      	elseCase += '\nelse {\n var b = ' + codeGenerator(node.body[2]) + ';\n}';
      }

      ifCase += 'if ' + codeGenerator(node.body[0]) + ' {\n var a = ' + 
		 codeGenerator(node.body[1]) + ';\n}' + elseCase;

	  return ifCase;

    // For `Identifiers` we'll just return the `node`'s name.
    case 'Identifier':
      return node.name;

    // For `NumberLiterals` we'll just return the `node`'s value.
    case 'NumberLiteral':
      return node.value;

	case 'StringLiteral':
	  return node.value;  

    case 'Operator':
      return node.value;

    // And if we haven't recognized the node, we'll throw an error.
    default:
      throw new TypeError(node.type);
  }
}

/**
 * ============================================================================
 *                                  (۶* ‘ヮ’)۶”
 *                         !!!!!!!!THE COMPILER!!!!!!!!
 * ============================================================================
 */

/**
 * FINALLY! We'll create our `compiler` function. Here we will link together
 * every part of the pipeline.
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */

// function compiler(input) {
//   var tokens = tokenizer(input);
//   var ast    = parser(tokens);
//   var newAst = transformer(ast);
//   var output = codeGenerator(newAst);

//   // and simply return the output!
//   return output;
// }

function compiler(input, options) {

  console.log("Initial input: \n" + input + "\n");

  var tokens, ast, newAst, output;

  if(options.debug) {
    var tokens = tokenizer(input);
    console.log("Tokens: \n" + JSON.stringify(tokens, null, '  ') + "\n");

    var ast    = parser(tokens);
    console.log("AST: \n" + JSON.stringify(ast, null, '  ') + "\n");

    var newAst = transformer(ast);
	console.log("NEWAST: \n" + JSON.stringify(newAst, null, '  ') + "\n");

    var output = codeGenerator(newAst);
  }
  else {
    tokens = tokenizer(input);
    ast    = parser(tokens);
    newAst = transformer(ast);
    output = codeGenerator(newAst);
  }

  console.log("Final Output: \n" + output);
  console.log("\n=========================================================================\n");

  // and simply return the output!
  return output;
}

/**
 * ============================================================================
 *                                   (๑˃̵ᴗ˂̵)و
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!YOU MADE IT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!VariableDeclarator
 * ============================================================================
 */

// Now I'm just exporting everything...
module.exports = {
  tokenizer: tokenizer,
  parser: parser,
  transformer: transformer,
  codeGenerator: codeGenerator,
  compiler: compiler
};