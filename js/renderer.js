const { remote, ipcRenderer } = require('electron')
const mousetrap = require('mousetrap');

let current_layout = 0;

// Generate key bindings to allow user to type input
let autoInput = ['1','2','3','4','5','6','7','8','9','0',
                '*','plus','/','-', "=", "enter", "backspace"];

autoInput.forEach(function(e) {
  mousetrap.bind(e, function() {
    input(e);
  })
})

// document.getElementById('menu-button').addEventListener('click', (event) => {
//   ipcRenderer.send('display-app-menu', {
//     x: event.x,
//     y: event.y
//   })
// })

document.getElementById('minimize-button').addEventListener('click', () => {
  remote.getCurrentWindow().minimize()
})

// document.getElementById('min-max-button').addEventListener('click', () => {
//   const currentWindow = remote.getCurrentWindow()
//   if(currentWindow.isMaximized()) {
//     currentWindow.unmaximize()
//   } else {
//     currentWindow.maximize()
//   }
// })

document.getElementById('close-button').addEventListener('click', () => {
  remote.app.quit()
})

// Expands or collapses the calculator
document.getElementById('expand-calc').addEventListener('click', () => {
  ipcRenderer.send('expand-calculator', {
    current: current_layout
  });
  
  // Remove all current buttons
  let parent = document.getElementById('parent');
  while(parent.hasChildNodes()) {
    parent.firstChild.remove();
  }

  current_layout = current_layout^1;
  generate(current_layout);

  // Rotate arrow keys on expand button based on status.
  if(current_layout == 1) {
    document.getElementById('expand-indicator').style = "transform: rotate(270deg);"
  } else {
    document.getElementById('expand-indicator').style = "transform: rotate(90deg);"
  }

})

// Once our document is ready, generate our default calculator layout.
document.addEventListener("DOMContentLoaded", function(e) {
  generate(current_layout);
});

// Generate buttons
function generate(val) {

  let gen = layouts[val];
  let parent = document.getElementById('parent');

  //<button class="child" onclick="input('C')">C</button>
  gen.forEach(function(e) {
    
    // Create our button element
    let button = document.createElement('button');
    button.className = "child";
    button.onclick = function() {input(e)};
    button.textContent = e;

    if(val == 0)
      button.style = "flex: 1 0 21%;";
    else if(val == 1)
      button.style = "flex: 1 0 17%;";

    parent.appendChild(button);
    
  });

}

let layouts = [

  // Default Layout
  [ 
    'C', '%', 'DEL', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '+-', '0', '.', '=',
  ],

  // Expanded Layout
  [
    'C', '%', 'DEL', '/', 'π',
    '7', '8', '9', '*', '**',
    '4', '5', '6', '-', '√',
    '1', '2', '3', '+', '(',
    '+-', '0', '.', '=', ')',
  ]
]

function input(val) {

  let inputfield = document.getElementById('inputfield');

  if(val === "C") {

      // Clear
      inputfield.value = "";

  } else if(val === "DEL" || val === "backspace") {

      // Delete last char
      inputfield.value = inputfield.value.slice(0, -1);

  } else if(val === "+-") {

      // Negate the current math.evaluation
      let content = inputfield.value;

      if(content === "")
          return;

      if(content.startsWith("-")) {
          let content = inputfield.value;
          inputfield.value = content.substring(1);
      } else {
          inputfield.value = "-" + content;
      }

  } else if(val === "=" || val === "enter") {

      // math.evaluate
      let temp = parseEval(inputfield.value);

      // Round to 6 decimal places
      if(temp % 1 != 0)
          inputfield.value = temp.toFixed(6);
      else
          inputfield.value = temp;

  } else if(val === ".") {

      let temp = math.eval(inputfield.value);

      if(temp % 1 == 0)
          document.getElementById('inputfield').value += val;

  } else if(val === "√") {

    document.getElementById('inputfield').value += val + "(";

  } else if(val === "plus") {

    document.getElementById('inputfield').value += "+";

  } else {

    // Otherwise, add the given value to the field
    document.getElementById('inputfield').value += val;

  }
}

// TODO:
// Parses our evaluation string to translate things like
// π --> pi
// This is because the math.eval() function requires certain things
function parseEval(str) {
  str = str.replace("π", "pi");
  str = str.replace("√", "sqrt");

  let eval;

  // Make sure the sqrt val is surrounded by paren's
  try {
    eval = math.eval(str);
  } catch(err) {
    if(err.message.includes("Parenthesis ) expected")) {
      str += ")";
      eval = math.eval(str);
    }
  }
  return eval;
}