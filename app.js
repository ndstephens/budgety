//?--------------------------------------
//?--------- BUDGET CONTROLLER ----------
//?--------------------------------------
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

  function calculateTotal(type) {
    data.totals[type] = data.allItems[type].reduce(function(acc, cur) {
      return acc + cur.value;
    }, 0);
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
      totalInc: data.totals.inc,
      totalExp: data.totals.exp,
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
//?----------------------------------
//?--------- UI CONTROLLER ----------
//?----------------------------------
var UIController = (function() {
  //* put all strings into one object.  it's easier to manage, and if string names change later, you don't need to find them throughout the app.  plus helps prevent misspellings, etc.
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
  };

  var cacheDOM = {
    inputType: document.querySelector(DOMStrings.inputType),
    inputDescription: document.querySelector(DOMStrings.inputDescription),
    inputValue: document.querySelector(DOMStrings.inputValue),
    inputBtn: document.querySelector(DOMStrings.inputBtn),
    incomeContainer: document.querySelector(DOMStrings.incomeContainer),
    expenseContainer: document.querySelector(DOMStrings.expenseContainer),
    budgetLabel: document.querySelector(DOMStrings.budgetLabel),
    incomeLabel: document.querySelector(DOMStrings.incomeLabel),
    expenseLabel: document.querySelector(DOMStrings.expenseLabel),
    percentageLabel: document.querySelector(DOMStrings.percentageLabel),
    container: document.querySelector(DOMStrings.container),
  };

  //* provide non-direct access to DOMStrings object
  function getDOMStrings() {
    return DOMStrings;
  }

  //* provide non-direct access to cacheDOM object
  function getcacheDOM() {
    return cacheDOM;
  }

  function getInput() {
    return {
      type: cacheDOM.inputType.value,
      description: cacheDOM.inputDescription.value,
      value: parseFloat(cacheDOM.inputValue.value),
    }; // type = 'inc' or 'exp'
  }

  function addListItem(obj, type) {
    var incomeHTML, expenseHTML, html, element;

    incomeHTML = `<div class="item clearfix" id="inc-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                      <div class="item__value">${obj.value}</div>
                      <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
                    </div>
                  </div>`;

    expenseHTML = `<div class="item clearfix" id="exp-${obj.id}">
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
    //* this could be much simpler and more direct
    var fields, fieldsArr;

    fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

    fieldsArr = Array.prototype.slice.call(fields);

    fieldsArr.forEach(function(field) {
      field.value = '';
    });

    fieldsArr[0].focus(); // put focus back on the description field
  }

  function displayBudget(obj) {
    cacheDOM.budgetLabel.textContent = obj.budget.toFixed(2);
    cacheDOM.incomeLabel.textContent = '+ ' + obj.totalInc.toFixed(2);
    cacheDOM.expenseLabel.textContent = '- ' + obj.totalExp.toFixed(2);
    if (obj.percentage > 0) {
      cacheDOM.percentageLabel.textContent = obj.percentage + '%';
    } else {
      cacheDOM.percentageLabel.textContent = '---';
    }
  }

  return {
    getDOMStrings: getDOMStrings,
    getcacheDOM: getcacheDOM,
    getInput: getInput,
    addListItem: addListItem,
    clearFields: clearFields,
    displayBudget: displayBudget,
  };
})();

//
//
//?-----------------------------------
//?--------- APP CONTROLLER ----------
//?-----------------------------------
var controller = (function(budgetCtrl, UICtrl) {
  //* improved organization and debugging of similar code
  function setupEventListeners() {
    // var UI_DOM = UICtrl.getDOMStrings();
    var UI_cacheDOM = UICtrl.getcacheDOM();

    UI_cacheDOM.inputDescription.focus();
    UI_cacheDOM.inputBtn.addEventListener('click', ctrlAddItem);

    //* 'ENTER' key can trigger input (except when the button is in focus, otherwise the function will fire twice)
    document.addEventListener('keypress', function(event) {
      //* use 'event.which' for older browsers
      if ((event.keyCode === 13 || event.which === 13) && !(document.activeElement === UI_cacheDOM.inputBtn)) {
        ctrlAddItem();
      }
    });

    //* EVENT DELEGATION, add event to container, but listen for the specific target (when clicking on each item's delete button)
    UI_cacheDOM.container.addEventListener('click', ctrlDeleteItem);
  }

  function updateBudget() {
    var budget;
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    budget = budgetCtrl.getBudget();
    // 3. Display the budget in the UI
    UICtrl.displayBudget(budget);
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

  function ctrlDeleteItem(event) {
    var el, splitID, type, ID;

    el = event.target;
    //* first check whether the close icon or its parent button element were the target
    if (el.classList.contains('item__delete--btn') || el.parentNode.classList.contains('item__delete--btn')) {
      while (!el.id && (!el.id.startsWith('inc-') || !el.id.startsWith('exp-'))) {
        el = el.parentNode;
        if (el === document) {
          break;
        }
      }
      if (el.id) {
        splitID = el.id.split('-');
        type = splitID[0];
        ID = splitID[1];
      }
    }

    console.log(splitID);

    // 1. Delete item from data structure
    // 2. Delete item from UI
    // 3. Update and display the budget
    // 4. Clear splitID
  }

  function init() {
    setupEventListeners();
    UICtrl.displayBudget({
      budget: 0,
      totalInc: 0,
      totalExp: 0,
      percentage: -1,
    });
  }

  return {
    init: init,
  };
})(budgetController, UIController);

//
//
controller.init();
