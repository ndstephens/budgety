//?--------- BUDGET CONTROLLER ----------
var budgetController = (function() {
  // body
})();

//?--------- UI CONTROLLER ----------
var UIController = (function() {
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
  };

  function getInput() {
    return {
      type: document.querySelector(DOMStrings.inputType).value, // 'inc' or 'exp'
      description: document.querySelector(DOMStrings.inputDescription).value,
      value: document.querySelector(DOMStrings.inputValue).value,
    };
  }

  function getDOMStrings() {
    return DOMStrings;
  }

  return {
    getInput: getInput,
    getDOMStrings: getDOMStrings,
  };
})();

//?--------- APP CONTROLLER ----------
var controller = (function(budgetCtrl, UICtrl) {
  var DOM = UICtrl.getDOMStrings();

  var ctrlAddItem = function() {
    // 1. Get input data
    var input = UICtrl.getInput();
    console.log(input);
    // 2. Add item to the budget controller
    // 3. Add item to the UI
    // 4. Calculate the budget
    // 5. Display the budget in the UI
  };

  document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

  //* enables the 'ENTER' key to also trigger the input (regardless of what's in focus)
  document.addEventListener('keypress', function(event) {
    //* use 'event.which' for older browsers
    if (event.keyCode === 13 || event.which === 13) {
      ctrlAddItem();
    }
  });
})(budgetController, UIController);
