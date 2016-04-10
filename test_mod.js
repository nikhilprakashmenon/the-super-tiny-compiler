var superTinyCompiler = require('./super-tiny-compiler-nik-mod-2');

var tokenizer     = superTinyCompiler.tokenizer;
var parser        = superTinyCompiler.parser;
var transformer   = superTinyCompiler.transformer;
var codeGenerator = superTinyCompiler.codeGenerator;
var compiler      = superTinyCompiler.compiler;


var expressionTest = function(debugFlag) {

  console.log("\n\t\t ARITHMETIC EXPRESSIONS \t\n");

  var input1 = '(+ 10 20)';
  var input2 = '(* x 10)';
  var input3 = '(+ ident (/ 3 2))';
  var input4 = '(/ (* 10 2) (- 5 2))';
  var input5 = '(* 15 (+ 20 5))';

  compiler(input1, debugFlag);
  compiler(input2, debugFlag);
  compiler(input3, debugFlag);
  compiler(input4, debugFlag);
  compiler(input5, debugFlag);
};

var variableDeclarationTest = function(debugFlag) {

  console.log("\n\t\t VARIABLE DECLARATIONS \t\n");
  
  var input1 = '(defvar str string)';
  var input2 = '(defvar x (+ ident (* 50 100)))';
  var input3 = '(defvar iden (/ 100 2))';

  compiler(input1, debugFlag);
  compiler(input2, debugFlag);
  compiler(input3, debugFlag);
};

var IfStatementtest = function(debugFlag) {

  console.log("\n\t\t IF STATEMENTS \t\n");

  var input1 = '(if (> 10 2) (+ 3 5) (* 3 5))';
  var input2 = '(if (< 3 1) 10 20)';
  var input3 = '(if (= 10 10) (/ (* 5 2) 10) 20)';

  compiler(input1, debugFlag);
  compiler(input2, debugFlag);
  compiler(input3, debugFlag);

};

var options = { debug: false};

// expressionTest(options);
// variableDeclarationTest(options);
IfStatementtest(options);