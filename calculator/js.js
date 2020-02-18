//variables
let exp = '';
let ans='';
let first = document.querySelector(".first");
let second = document.querySelector(".second");
let three = document.querySelector(".three");
let four = document.querySelector(".four");
let five = document.querySelector(".five");
let six = document.querySelector(".six");
let seven = document.querySelector(".seven");
let eight = document.querySelector(".eight");
let nine = document.querySelector(".nine");
let bracket_first = document.querySelector(".bracket_first");
let bracket_second = document.querySelector(".bracket_second");
let percentage = document.querySelector(".percentage");
let Allclean = document.querySelector(".Allclean");
let clean = document.querySelector(".clean");
let divide = document.querySelector(".divide");
let multiple = document.querySelector(".multiple");
let subtract = document.querySelector(".subtract");
let zero = document.querySelector(".zero");
let dot = document.querySelector(".dot");
let equality = document.querySelector(".equality");
let add = document.querySelector(".add");
let calculator_key = document.querySelector(".calculator_key");
let main_input = document.querySelector(".main-input");
let mini_input = document.querySelector(".mini-input");

//func
let addZero = () => {
    if (exp[0] == '.') {
        exp = '0.'
    }
    main_input.textContent = exp;
};

let checkElem = () => {
    let target = event.target;
    let lastLetter = exp[exp.length-1];
    if (target.classList.contains('partsExp')) {
        if (target.textContent == '.' && (lastLetter == ')' || lastLetter == '(' || lastLetter == '/' ||   lastLetter == '*' ||  lastLetter == '+' ||  lastLetter == '-')) {
            exp = exp + "0" +event.target.innerHTML;
        } else if ((target.textContent == '+' ||target.textContent == '-' ||target.textContent == '*' ||target.textContent == '/') && (lastLetter == '/' ||   lastLetter == '*' ||  lastLetter == '+' ||  lastLetter == '-')) {
            exp = exp.slice(0, exp.length - 1) + target.textContent;
        }
        else {
            exp = exp + event.target.innerHTML;
        }
        main_input.textContent = exp;
    }
    addZero();
};
calculator_key.addEventListener('click', checkElem);
let AllcleanExpression = () => {
    exp = '';
    ans = '';
    mini_input.textContent = exp;
    main_input.textContent = exp;
};
Allclean.addEventListener('click', AllcleanExpression);
let cleanExpression = () => {
    exp = exp.slice(0, exp.length - 1);
    main_input.textContent = exp;
};
clean.addEventListener('click', cleanExpression);

let getAns = () => {
    try {
        ans = eval(exp);
        mini_input.textContent = exp + '=';
        main_input.textContent = ans;
        exp = ans;
    } catch (err) {
        alert('please,input correct expression');
        exp = '';
        main_input,textContent = exp;
    }
    // ans = eval(exp);
    // mini_input.textContent = exp + '=';
    // main_input.textContent = ans;
    // exp = ans;
};
equality.addEventListener('click', getAns);
