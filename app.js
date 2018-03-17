//?--------- BUDGET CONTROLLER ----------
var budgetController = (function() {
  // body
})();

//?--------- UI CONTROLLER ----------
var UIController = (function() {
  // some code later
})();

//?--------- APP CONTROLLER ----------
var controller = (function(budgetCtrl, UICtrl) {
  var ctrlAddItem = function() {
    console.log("click");
    // 1. Get input data
    // 2. Add item to the budget controller
    // 3. Add item to the UI
    // 4. Calculate the budget
    // 5. Display the budget in the UI
  };

  document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);

  //* enables the 'ENTER' key to also trigger the input
  document.addEventListener("keypress", function(event) {
    //* use 'event.which' for older browsers
    if (event.keyCode === 13 || event.which === 13) {
      ctrlAddItem();
    }
  });
})(budgetController, UIController);
