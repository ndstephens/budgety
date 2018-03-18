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

  function calculateTotal(type) {
    data.totals[type] = data.allItems[type].reduce(function(acc, cur) {
      return acc + cur.value;
    }, 0);
  }

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
    budget: 0,
    percentage: -1, //* '-1' means value does not exist
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

  function calculateBudget() {
    // 1. Calculate total income and expenses
    calculateTotal('exp');
    calculateTotal('inc');

    // 2. Calculate the budget: income - expenses
    data.budget = data.totals.inc - data.totals.exp;

    // 3. Calculate the percentage of income that was spent
    if (data.totals.inc > 0) {
      data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
    } else {
      data.percentage = -1;
    }
  }

  function getBudget() {
    return {
      budget: data.budget,
      totalIncome: data.totals.inc,
      totalExpenses: data.totals.exp,
      percentage: data.percentage,
    };
  }

  return {
    addItem: addItem,
    calculateBudget: calculateBudget,
    getBudget: getBudget,
    testData: data, //! TEMPORARY FOR TESTING
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
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
  };

  //* prevents direct access to DOMStrings object
  function getDOMStrings() {
    return DOMStrings;
  }

  function getInput() {
    return {
      type: document.querySelector(DOMStrings.inputType).value,
      description: document.querySelector(DOMStrings.inputDescription).value,
      value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
    }; // type = 'inc' or 'exp'
  }

  function addListItem(obj, type) {
    var incomeHTML, expenseHTML, html, element;

    incomeHTML = `<div class="item clearfix" id="income-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                      <div class="item__value">${obj.value}</div>
                      <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
                    </div>
                  </div>`;

    expenseHTML = `<div class="item clearfix" id="expense-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                      <div class="item__value">${obj.value}</div>
                      <div class="item__percentage">21%</div>
                      <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
                    </div>
                  </div>`;

    // 1. Create HTML string with placeholder text
    if (type === 'inc') {
      html = incomeHTML;
      element = DOMStrings.incomeContainer;
    } else if (type === 'exp') {
      html = expenseHTML;
      element = DOMStrings.expenseContainer;
    }

    // 2. Replace placeholder text with some actual data
    /* already done with template literal, however if strings were used, then instead of '${obj.id}' i could have written '%id%' as a placeholder.  then here could write
    newHtml = html.replace('%id%', obj.id);  for example
    */

    // 3. Insert HTML into the DOM
    //* 'element' and 'html' and dynamically defined above based on the 'type' argument given to the function
    document.querySelector(element).insertAdjacentHTML('beforeend', html);
  }

  function clearFields() {
    var fields, fieldsArr;

    fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

    fieldsArr = Array.prototype.slice.call(fields);

    fieldsArr.forEach(function(field, index, array) {
      field.value = '';
    });

    fieldsArr[0].focus(); // put focus back on the description field
  }

  return {
    getDOMStrings: getDOMStrings,
    getInput: getInput,
    addListItem: addListItem,
    clearFields: clearFields,
  };
})();

//
//
//?--------- APP CONTROLLER ----------
var controller = (function(budgetCtrl, UICtrl) {
  //* improved organization and debugging of similar code
  function setupEventListeners() {
    var DOM = UICtrl.getDOMStrings();
    var inputBtn = document.querySelector(DOM.inputBtn);

    inputBtn.addEventListener('click', ctrlAddItem);

    //* 'ENTER' key can trigger input (except when the button is in focus, otherwise the function will fire twice)
    document.addEventListener('keypress', function(event) {
      //* use 'event.which' for older browsers
      if ((event.keyCode === 13 || event.which === 13) && !(document.activeElement === inputBtn)) {
        ctrlAddItem();
      }
    });
  }

  function updateBudget() {
    var budget;
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    budget = budgetCtrl.getBudget();
    // 3. Display the budget in the UI
    console.log(budget);
  }

  function ctrlAddItem() {
    var input, newItem;

    // 1. Get input data
    input = UICtrl.getInput();

    //* validate existence of description and value
    if (input.description && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear fields
      UICtrl.clearFields();

      // 5. Calc and update budget
      updateBudget();
    }
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
