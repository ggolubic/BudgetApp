const budgetController = (() => {

    const Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };
    const Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    const data = {
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
        addItem: (type, desc, val) => {
            let newItem, ID, newItem_stringified;
            //Create new ID
            //ID=Last ID +1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on inc or exp type
            if (type === `exp`) {
                newItem = new Expense(ID, desc, val);
            } else {
                newItem = new Income(ID, desc, val);
            }
            //Push it into data structure
            data.allItems[type].push(newItem);
            //Stringify new item 
            newItem_stringified = JSON.stringify(newItem);
            //Push it into localStorage
            localStorage.setItem(`${type}-${ID}`, newItem_stringified);
            //Return the new element
            return newItem;
        },
        newBudget: (type, val) => {
            //update type value
            data.totals[type] += val;
            //update total value
            data.totals.total = data.totals[`inc`] - data.totals[`exp`];
            //return all values
            return data.totals;
        },
        adjustBudget: (type, id) => {
            //find position of object that you want to delete
            const pos = data.allItems[type].findIndex(x => x.id == id);
            //find value of that object
            const val = data.allItems[type][pos].value;
            //remove that object from localStorage and data structure
            localStorage.removeItem(`${type}-${id}`);
            data.allItems[type].splice(pos, 1);
            //update total type value
            data.totals[type] -= val;
            //update total value
            data.totals.total = data.totals[`inc`] - data.totals[`exp`];
            //return all values
            return data.totals;
        }
    }

})();




//UI MODULE

const UIController = (() => {

    const DOMStrings = {
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
        getInput: () => {
            return {
                //return all input values
                type: document.querySelector(DOMStrings.inputType).value, //will be inc or exp
                desc: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
                //return all the values as an object so you don't have to return them 1 by 1
            };

        },
        getDOMStrings: () => DOMStrings,

        addToUI: (type, desc, value, ID) => {

            if (type === `inc`) {
                //add new html for income
                document.querySelector(DOMStrings.incomeList).innerHTML += `<div class=item clearfix id=inc-${ID}>
                    <div class=item__description>${desc}</div>
                    <div class=right clearfix>
                        <div class=item__value>${value}</div>  
                        <div class=item__delete>
                            <button class=item__delete--btn id=btn-inc><i class=ion-ios-close-outline></i></button>
                        </div>
                    </div>
                </div>`


            } else {
                //add new html for expenses
                document.querySelector(DOMStrings.expenseList).innerHTML += `<div class=item clearfix id=exp-${ID}>
                    <div class=item__description>${desc}</div>
                    <div class=right clearfix>
                        <div class=item__value>${value}</div>
                        <div class=item__delete>
                            <button class=item__delete--btn id=btn-inc><i class=ion-ios-close-outline></i></button>
                        </div>
                    </div>
                </div>`
            }

        },
        displayBudget: (type, budgetObj) => {

            //budgetObj contains current budget totals
            const incVal = document.querySelector(DOMStrings.budgetIncomeValue);
            const expVal = document.querySelector(DOMStrings.budgetExpensesValue);
            const budgetVal = document.querySelector(DOMStrings.budgetValue);
            if (type === `inc`) {
                //update income UI
                incVal.innerHTML = `+ ${budgetObj["inc"]}`;

            } else {
                //update expenses UI
                expVal.innerHTML = `- ${budgetObj["exp"]}`;
            }
            budgetVal.innerHTML = `${budgetObj["total"]} kn`;
        },


        clearFields: () => {
            const fields = document.querySelectorAll(`${DOMStrings.inputValue}, ${DOMStrings.inputDesc}`); //returns a list
            let fieldsArr = [];
            fieldsArr = Array.from(fields); //turn list into array
            //loop over array and set current value to null
            fieldsArr.forEach(cur => cur.value = "");
            fieldsArr[0].focus();

        },


        removeItem: (type, id) => {

            //find item in DOM
            const item = document.querySelector(`#${type}-${id}`);
            //tell parent node to remove that div
            item.parentNode.removeChild(item);

        },
        changeFields: () => {
            const fields = document.querySelectorAll(`${DOMStrings.inputType},${DOMStrings.inputDesc},${DOMStrings.inputValue}`);
            const fieldsArr = Array.from(fields);
            fieldsArr.forEach(cur => cur.classList.toggle('red-focus'));
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            console.log(fieldsArr);

        },
        getDate: () => {
            //update month
            const date = new Date()
            const months = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];
            document.querySelector(`.budget__title--month`).innerHTML = `${months[date.getMonth()]}, ${date.getFullYear()}`;
        }
    };

})();




//MAIN MODULE


const controller = ((budgetCntrl, UICntrl) => {

    const DOM = UICntrl.getDOMStrings();

    const setEventListeners = () => {
        document.querySelector(DOM.inputBtn).addEventListener('click', ValidateInput);
        //Add global event listener if user presses Enter
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) { //keyCode za enter, event.which za IE9-

                ValidateInput();
            }
        });
        //add event listener for inc or exp change
        document.querySelector(DOM.inputType).addEventListener('change', UICntrl.changeFields);
        //add event listener for deleting
        document.querySelector(DOM.container).addEventListener('click', cntrlDelItem);

    };


    const ValidateInput = () => {
        const input = UICntrl.getInput();
        if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
            cntrlAddItem(input);
        }
    }
    const cntrlAddItem = input => {

        //2. add item to budget controller
        const newBudgetItem = budgetCntrl.addItem(input.type, input.desc, input.value);

        //3. add new item to UI
        const newUIItem = UICntrl.addToUI(input.type, input.desc, input.value, newBudgetItem.id);

        //4.clear the fields
        UICntrl.clearFields();

        //5. calc the budget
        const calcBudget = budgetCntrl.newBudget(input.type, input.value);

        //6. display the budget
        UICntrl.displayBudget(input.type, calcBudget);



    };

    const cntrlDelItem = event => {
        let type, splitID, id;
        //1.find the ID of the div that the user wants to remove
        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //hardcoded html so we can hardcode parentNode as well
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
        const newBudget = budgetCntrl.adjustBudget(type, id);
        //5. display new budget
        UICntrl.displayBudget(type, newBudget);


    };
    const loadLocalStorage = () => {
        for (let i = 0; i < localStorage.length; i++) {
            const {
                desc,
                id,
                value
            } = JSON.parse(localStorage.getItem(localStorage.key(i)));

            const type = localStorage.key(i).split(`-`);
            const inputObj = {
                type: type[0],
                desc: desc,
                value: value
            }
            cntrlAddItem(inputObj);

        }

    };

    UICntrl.getDate();

    return {
        init: () => {
            if (new Date().getDate === 1) {
                localStorage.clear();
            } else if (localStorage.length !== 0) {
                loadLocalStorage();
            } else {

            }
            setEventListeners();
        }

    }
})(budgetController, UIController);



controller.init();
