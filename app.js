//?--------------------------------------
//?--------- BUDGET CONTROLLER ----------
//?--------------------------------------
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //* a condensed data structure
  var _data = {
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
    if (_data.allItems[type].length > 0) {
      ID = _data.allItems[type][_data.allItems[type].length - 1].id + 1;
    } else {
      ID = 0;
    }

    // Create new item
    if (type === 'exp') {
      newItem = new Expense(ID, des, val);
    } else if (type === 'inc') {
      newItem = new Income(ID, des, val);
    }

    // Add to the _data structure
    _data.allItems[type].push(newItem);
    return newItem;
  }

  function deleteItem(type, id) {
    //* id is a string, so using == type coercion (or could change to a number)
    var index = _data.allItems[type].findIndex(item => item.id == id);
    if (index >= 0) {
      _data.allItems[type].splice(index, 1);
    }
  }

  function _calculateTotal(type) {
    _data.totals[type] = _data.allItems[type].reduce(function(acc, cur) {
      return acc + cur.value;
    }, 0);
  }

  function calculateBudget() {
    // 1. Calculate total income and expenses
    _calculateTotal('exp');
    _calculateTotal('inc');

    // 2. Calculate the budget: income - expenses
    _data.budget = _data.totals.inc - _data.totals.exp;

    // 3. Calculate the percentage of income that was spent
    if (_data.budget > 0) {
      _data.percentage = Math.round(_data.totals.exp / _data.totals.inc * 100);
    } else {
      _data.percentage = -1;
    }
  }

  function calculatePercentages() {
    _data.allItems.exp.forEach(item => item.calcPercentage(_data.totals.inc));
  }

  function getPercentages() {
    return _data.allItems.exp.map(item => item.getPercentage());
  }

  function getBudget() {
    return {
      budget: _data.budget,
      totalInc: _data.totals.inc,
      totalExp: _data.totals.exp,
      percentage: _data.percentage,
    };
  }

  return {
    addItem: addItem,
    deleteItem: deleteItem,
    calculateBudget: calculateBudget,
    calculatePercentages: calculatePercentages,
    getPercentages: getPercentages,
    getBudget: getBudget,
    testData: _data, // TODO: TEMPORARY FOR TESTING
  };
})();

//
//
//?----------------------------------
//?--------- UI CONTROLLER ----------
//?----------------------------------
var UIController = (function() {
  //* put all strings into one object.  it's easier to manage, and if string names change later, you don't need to find them throughout the app.  plus helps prevent misspellings, etc.
  var _DOMStrings = {
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
    expPercentLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  var _cacheDOM = {
    inputType: document.querySelector(_DOMStrings.inputType),
    inputDescription: document.querySelector(_DOMStrings.inputDescription),
    inputValue: document.querySelector(_DOMStrings.inputValue),
    inputBtn: document.querySelector(_DOMStrings.inputBtn),
    incomeContainer: document.querySelector(_DOMStrings.incomeContainer),
    expenseContainer: document.querySelector(_DOMStrings.expenseContainer),
    budgetLabel: document.querySelector(_DOMStrings.budgetLabel),
    incomeLabel: document.querySelector(_DOMStrings.incomeLabel),
    expenseLabel: document.querySelector(_DOMStrings.expenseLabel),
    percentageLabel: document.querySelector(_DOMStrings.percentageLabel),
    container: document.querySelector(_DOMStrings.container),
    dateLabel: document.querySelector(_DOMStrings.dateLabel),
  };

  //? --- PRIVATE FUNCTIONS START ---
  function _formatNumber(num, type) {
    // + or - , 2 decimals, comma separation
    var _num, _type;

    _num = Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    //* check the number sign to get its type if 'type' isn't given, available, or if value is calculated (used primarily for the main Budget number since its value is calculated and can be '0' or negative)
    function checkType(num) {
      if (Math.sign(num) === 1) {
        return 'inc';
      } else if (Math.sign(num) === -1) {
        return 'exp';
      } else if (Math.sign(num) === 0 || -0) {
        return '';
      }
    }

    //* use 'type' if given, otherwise use function to find 'type'
    _type = type || checkType(num);

    if (_type === 'inc') {
      return '+ ' + _num;
    } else if (_type === 'exp') {
      return '- ' + _num;
    } else {
      return _num; //* no sign if '0'
    }
  }

  function _nodeListForEach(nodeList, callback) {
    for (let i = 0; i < nodeList.length; i++) {
      callback(nodeList[i], i);
    }
  }

  //* provide non-direct access to _DOMStrings object
  function getDOMStrings() {
    return _DOMStrings;
  }

  //* provide non-direct access to _cacheDOM object
  function getcacheDOM() {
    return _cacheDOM;
  }
  //? --- PRIVATE FUNCTIONS END ---

  function getInput() {
    return {
      type: _cacheDOM.inputType.value,
      description: _cacheDOM.inputDescription.value,
      value: parseFloat(_cacheDOM.inputValue.value),
    }; // type = 'inc' or 'exp'
  }

  function addListItem(obj, type) {
    var incomeHTML, expenseHTML, html, element;

    incomeHTML = `<div class="item clearfix" id="inc-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                      <div class="item__value">${_formatNumber(obj.value, type)}</div>
                      <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
                    </div>
                  </div>`;

    expenseHTML = `<div class="item clearfix" id="exp-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                      <div class="item__value">${_formatNumber(obj.value, type)}</div>
                      <div class="item__percentage">21%</div>
                      <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
                    </div>
                  </div>`;

    // 1. Create HTML string with placeholder text
    if (type === 'inc') {
      html = incomeHTML;
      element = _DOMStrings.incomeContainer;
    } else if (type === 'exp') {
      html = expenseHTML;
      element = _DOMStrings.expenseContainer;
    }

    // 2. Replace placeholder text with some actual data
    /* already done with template literal, however if strings were used, then instead of '${obj.id}' i could have written '%id%' as a placeholder.  then here could write
    newHtml = html.replace('%id%', obj.id);  for example
    */

    // 3. Insert HTML into the DOM
    //* 'element' and 'html' and dynamically defined above based on the 'type' argument given to the function
    document.querySelector(element).insertAdjacentHTML('beforeend', html);
  }

  function deleteListItem(elementID) {
    var el = document.querySelector('#' + elementID);
    el.parentNode.removeChild(el);
  }

  function clearFields() {
    //* this could be MUCH simpler and more direct
    var fields, fieldsArr;

    fields = document.querySelectorAll(_DOMStrings.inputDescription + ', ' + _DOMStrings.inputValue);

    fieldsArr = Array.prototype.slice.call(fields);

    fieldsArr.forEach(function(field) {
      field.value = '';
    });

    fieldsArr[0].focus(); // put focus back on the description field
  }

  //* 'obj' is the returned object of budgetController.getBudget
  function displayBudget(obj) {
    _cacheDOM.budgetLabel.textContent = _formatNumber(obj.budget);
    _cacheDOM.incomeLabel.textContent = _formatNumber(obj.totalInc, 'inc');
    _cacheDOM.expenseLabel.textContent = _formatNumber(obj.totalExp, 'exp');
    if (obj.percentage > 0) {
      _cacheDOM.percentageLabel.textContent = obj.percentage + '%';
    } else {
      _cacheDOM.percentageLabel.textContent = '---';
    }
  }

  function displayPercentages(percentageArray) {
    var fields = document.querySelectorAll(_DOMStrings.expPercentLabel);

    _nodeListForEach(fields, function(expElement, index) {
      expElement.textContent = percentageArray[index] > 0 ? percentageArray[index] + '%' : '---';
    });
  }

  function displayMonth() {
    var formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    _cacheDOM.dateLabel.textContent = formattedDate;
  }

  function changedType() {
    var fields = document.querySelectorAll(`
      ${_DOMStrings.inputType}, 
      ${_DOMStrings.inputDescription},
      ${_DOMStrings.inputValue}
    `);

    _nodeListForEach(fields, function(cur) {
      cur.classList.toggle('red-focus');
    });

    _cacheDOM.inputBtn.classList.toggle('red');
  }

  return {
    getDOMStrings: getDOMStrings,
    getcacheDOM: getcacheDOM,
    getInput: getInput,
    addListItem: addListItem,
    deleteListItem: deleteListItem,
    clearFields: clearFields,
    displayBudget: displayBudget,
    displayPercentages: displayPercentages,
    displayMonth: displayMonth,
    changedType: changedType,
  };
})();

//
//
//?-----------------------------------
//?--------- APP CONTROLLER ----------
//?-----------------------------------
var controller = (function(budgetCtrl, UICtrl) {
  //* improved organization and debugging of similar code
  function _setupEventListeners() {
    // var UI_DOM = UICtrl.getDOMStrings();
    var UI_cacheDOM = UICtrl.getcacheDOM();

    UI_cacheDOM.inputDescription.focus();
    UI_cacheDOM.inputBtn.addEventListener('click', _ctrlAddItem);

    //* 'ENTER' key can trigger input (except when the button is in focus, otherwise the function will fire twice)
    document.addEventListener('keypress', function(event) {
      //* use 'event.which' for older browsers
      if ((event.keyCode === 13 || event.which === 13) && !(document.activeElement === UI_cacheDOM.inputBtn)) {
        _ctrlAddItem();
      }
    });

    //* EVENT DELEGATION, add event to container, but listen for the specific target (when clicking on each item's delete button)
    UI_cacheDOM.container.addEventListener('click', _ctrlDeleteItem);

    //* change event on input type ('inc' or 'exp') which will change all the inputs' border color, and the button's color
    UI_cacheDOM.inputType.addEventListener('change', UICtrl.changedType);
  }

  function _updateBudget() {
    var budget;
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    budget = budgetCtrl.getBudget();
    // 3. Display the budget in the UI
    UICtrl.displayBudget(budget);
  }

  function _updatePercentages() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  }

  function _ctrlAddItem() {
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
      _updateBudget();

      // 6. Calc and update the percentages
      _updatePercentages();
    }
  }

  function _ctrlDeleteItem(event) {
    var el, splitID, type, ID;

    el = event.target;
    //* first check whether the delete icon or its parent button element were the target
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

        // 1. Delete item from data structure
        budgetCtrl.deleteItem(type, ID);
        // 2. Delete item from UI
        UICtrl.deleteListItem(el.id);
        // 3. Update and display the budget
        _updateBudget();
        // 4. Calc and update the percentages
        _updatePercentages();
        // 5. Clear splitID
        splitID = [];
      }
    }
  }

  function init() {
    _setupEventListeners();
    UICtrl.displayMonth();
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
