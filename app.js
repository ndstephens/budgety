//?--------- BUDGET CONTROLLER ----------
var budgetController = (function() {
  // body
})();

//?--------- UI CONTROLLER ----------
var UIController = (function() {
  //* put all strings into one object.  it's easier to manage, and if string names change later, you don't need to find them throughout the app.  plus helps prevent misspellings, etc.
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
  };

  //* prevents direct access to DOMStrings object
  function getDOMStrings() {
    return DOMStrings;
  }

  function getInput() {
    return {
      type: document.querySelector(DOMStrings.inputType).value, // 'inc' or 'exp'
      description: document.querySelector(DOMStrings.inputDescription).value,
      value: document.querySelector(DOMStrings.inputValue).value,
    };
  }

  return {
    getDOMStrings: getDOMStrings,
    getInput: getInput,
  };
})();

//?--------- APP CONTROLLER ----------
var controller = (function(budgetCtrl, UICtrl) {
  //* improved organization and debugging of similar code
  function setupEventListeners() {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    //* 'ENTER' key can trigger input (regardless of current focus)
    document.addEventListener('keypress', function(event) {
      //* use 'event.which' for older browsers
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  }

  function ctrlAddItem() {
    // 1. Get input data
    var input = UICtrl.getInput();
    // 2. Add item to the budget controller
    // 3. Add item to the UI
    // 4. Calculate the budget
    // 5. Display the budget in the UI
  }

  function init() {
    setupEventListeners();
  }

  return {
    init: init,
  };
})(budgetController, UIController);

controller.init();
