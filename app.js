//?--------- BUDGET CONTROLLER ----------
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //* a condensed data structure
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
  };

  function addItem(type, des, val) {
    var newItem, ID;

    //* type will be 'inc' or 'exp'
    //* create an ID by increasing the ID of the last item in the array by '1'
    if (data.allItems[type].length > 0) {
      ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
    } else {
      ID = 0;
    }

    // Create new item
    if (type === 'exp') {
      newItem = new Expense(ID, des, val);
    } else if (type === 'inc') {
      newItem = new Income(ID, des, val);
    }

    // Add to the data structure
    data.allItems[type].push(newItem);
    return newItem;
  }

  return {
    addItem: addItem,
    testData: data, //* TEMPORARY FOR TESTING
  };
})();

//
//
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

//
//
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
    var input, newItem;

    // 1. Get input data
    input = UICtrl.getInput();

    // 2. Add item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

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

//
//
controller.init();
