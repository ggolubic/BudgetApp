var budgetController = (function () {

    var Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };
    var Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
            total: 0
        }
    };
    return {
        addItem: function (type, desc, val) {
            var newItem, ID;
            //Create new ID
            //ID=Last ID +1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on inc or exp type
            if (type === "exp") {
                newItem = new Expense(ID, desc, val);
            } else {
                newItem = new Income(ID, desc, val);
            }
            //Push it into data structure
            data.allItems[type].push(newItem);
            //Return the new element
            return newItem;
        },
        newBudget: function (type, val) {
            //update type value
            data.totals[type] += val;
            //update total value
            data.totals.total = data.totals["inc"] - data.totals["exp"];
            //return all values
            return data.totals;
        },
        adjustBudget: function (type, id) {
            var val;
            //find value in object array
            val = data.allItems[type][id].value;
            //update type value
            data.totals[type] -= val;
            //update total value
            data.totals.total = data.totals["inc"] - data.totals["exp"];
            //return all values
            return data.totals;
        }
    };


})();





//UI MODULE

var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncomeValue: '.budget__income--value',
        budgetExpensesValue: '.budget__expenses--value',
        container: '.container'
    };
    return {
        getInput: function () {
            return {

                //return all input values
                type: document.querySelector(DOMStrings.inputType).value, //will be inc or exp
                desc: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
                //return all the values as an object so you don't have to return them 1 by 1
            };

        },
        getDOMStrings: function () {
            return DOMStrings;
        },
        addToUI: function (type, desc, value, ID) {

            if (type === "inc") {
                //add new html for income
                document.querySelector(DOMStrings.incomeList).innerHTML += "<div class='item clearfix' id='inc-" + ID + "'>" +
                    "<div class='item__description'>" + desc + "</div>" +
                    "<div class='right clearfix'>" +
                    "<div class='item__value'>+" + value + "</div>" +
                    "<div class='item__delete'>" +
                    "<button class='item__delete--btn' id='btn-inc'><i class='ion-ios-close-outline'></i></button>" +
                    "</div>" +
                    "</div>" +
                    "</div>"

            } else {
                //add new html for expenses
                document.querySelector(DOMStrings.expenseList).innerHTML += "<div class='item clearfix' id='exp-" + ID + "'>" +
                    "<div class='item__description'>" + desc + "</div>" +
                    "<div class='right clearfix'>" +
                    "<div class='item__value'>-" + value + "</div>" +
                    "<div class='item__delete'>" +
                    "<button class='item__delete--btn' id='btn-exp'><i class='ion-ios-close-outline'></i></button>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
            }

        },
        displayBudget: function (type, budgetObj) {

            //budgetObj contains current budget totals
            var incVal = document.querySelector(DOMStrings.budgetIncomeValue);
            var expVal = document.querySelector(DOMStrings.budgetExpensesValue);
            var budgetVal = document.querySelector(DOMStrings.budgetValue);
            if (type === "inc") {
                //update income UI
                incVal.innerHTML = "+" + budgetObj["inc"];

            } else {
                //update expenses UI
                expVal.innerHTML = "-" + budgetObj["exp"];
            }
            budgetVal.innerHTML = budgetObj["total"] + " kn";
        },


        clearFields: function () {
            var fields = document.querySelectorAll(DOMStrings.inputValue + ', ' + DOMStrings.inputDesc); //returns a list
            var fieldsArr = [];
            fieldsArr = Array.prototype.slice.call(fields); //turn list into array
            //loop over array and set current value to null
            fieldsArr.forEach(function (current) {
                current.value = "";
            });
            fieldsArr[0].focus();



        },
        removeItem: function (type, id) {
            var item;
            //find item in DOM
            item = document.querySelector("#" + type + "-" + id)
            //tell parent node to remove that div
            item.parentNode.removeChild(item);

        },
        getDate: function () {
            //update month
            var date = new Date()
            var months = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];
            document.querySelector(".budget__title--month").innerHTML = months[date.getMonth()] + ", " + date.getFullYear();
        }
    };

})();




//MAIN MODULE


var controller = (function (budgetCntrl, UICntrl) {

    var setEventListeners = function () {
        document.querySelector(DOM.inputBtn).addEventListener("click", cntrlAddItem);
        //Add global event listener if user presses Enter
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) { //keyCode za enter, event.which za IE10-

                cntrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", cntrlDelItem);

    };


    var DOM = UICntrl.getDOMStrings();

    var cntrlAddItem = function () {
        var input, newBudgetItem, newUIItem, calcBudget;
        //1. get input data
        input = UICntrl.getInput();

        if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {

            //2. add item to budget controller
            newBudgetItem = budgetCntrl.addItem(input.type, input.desc, input.value);

            //3. add new item to UI
            newUIItem = UICntrl.addToUI(input.type, input.desc, input.value, newBudgetItem.id);

            //4.clear the fields
            UICntrl.clearFields();

            //5. calc the budget
            calcBudget = budgetCntrl.newBudget(input.type, input.value);

            //6. display the budget
            UICntrl.displayBudget(input.type, calcBudget);

        }


    };

    var cntrlDelItem = function (event) {
        var itemID, splitID, type, id, newBudget;
        //1.find the ID of the div that the user wants to remove
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //hardcoded html so we can hardcode parentNode as well
        //2. if item exists split itemID into type and id
        if (itemID) {
            //id will be inc-# or exp-# so split on -
            splitID = itemID.split('-');
            type = splitID[0];
            id = splitID[1];
        }
        //3. remove the item from UI
        UICntrl.removeItem(type, id);
        //4. update Budget
        newBudget = budgetCntrl.adjustBudget(type, id);
        //5. display new budget
        UICntrl.displayBudget(type, newBudget);


    };

    UICntrl.getDate();

    return {
        init: function () {
            setEventListeners();
        }
    };

})(budgetController, UIController);



controller.init();
