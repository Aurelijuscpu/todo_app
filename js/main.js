//Import javascript classes
import { Todo } from './todo.js';

//Strings
const EXPIRED = "E";
const NO_DEADLINE = "";

//HTML input type=checkbox attribute
const CHECK = "checked";

//CSS class names 
const CROSSED = "crossed";

//==========Select the elements=======
//Todo form
const addBtn = document.querySelector("#new-task-btn-add");
const list = document.querySelector('#list');
const description = document.querySelector('input[name="new-task-description-text"]');
const datetime = document.querySelector('input[name="new-task-deadline-datetime"]');

//Popup form
const popupDeleteForm = document.querySelector('.popup-confirm-form');
const popupDeleteClose = popupDeleteForm.querySelector('.popup-close-btn');
const popupDeleteCancel = popupDeleteForm.querySelector('.no');
const popupDeleteConfirm = popupDeleteForm.querySelector('.yes');;

//Overlay for any popup
const overlay = document.querySelector("#overlay");
//-----------Select the elements END---------

//Variables
let todosList = []; //Array with todo items
let id = 0;         //ID for inserting items, !INCREASE THIS EVERYTIME NEW OBJECT IS ADDED TO todosList ARRAY
let data = sessionStorage.getItem("todosList"); //JSON data, todosList array from sessionStorage
let curElement;     //Last clicked item, for asynchronous confirmation

//Load todo items from session storage, if there are any
if(data){
    let array = JSON.parse(data);
    saveTaskArray(array);
    showTodos(array);
}

//==========Listeners=========

//Listener for new task button "Add"
addBtn.addEventListener('click', function(){

    //Check for required fields
    if(fieldIsEmpty(description.value)){
        alert("Task name is required!");
        return;
    } 
    
    addNewTask(description.value, datetime.value);

    //Reset fields
    description.value = "";
    datetime.value = "";
})

//Listener for delete item confirmation
popupDeleteForm.addEventListener('click', event => {
    if(event.target == popupDeleteClose){
        closePopupDeleteForm();
    } else if(event.target == popupDeleteConfirm){
        if(curElement){
            deleteToDo(curElement);
            closePopupDeleteForm();
        }
    } else if(event.target == popupDeleteCancel){
        closePopupDeleteForm();
    }
})

//Close any popup listed in this listener
overlay.addEventListener('click', event => {
    if(event.target != popupDeleteForm){
        closePopupDeleteForm();
    }
})

//Select dynamically created list's element
list.addEventListener("click", (event) => {
    const element = event.target;
    let elementJob;

    if(element.hasAttribute("job")){
        elementJob = element.attributes.job.value; 
        if(elementJob == "complete") {
            completeToDo(element); 
            reloadListUI();
        } else if(elementJob == "delete"){
            openPopupDeleteForm();
            curElement = element;   //Set last clicked item
        }
    } else {
        return;
    }
})
//-------------LISTENERS END--------------

//===========UI RELATED FUNCTIONS==========
/**
 * Remove all child elements from list UI
 */
function cleanListUI(){
    while (list.firstChild) {
        list.removeChild(list.lastChild);
    }
}

/**
 * Show confirm popup, when trying to delete todo item
 */
function openPopupDeleteForm(){
    popupDeleteForm.classList.add('active');
    overlay.classList.add('active');
}

/**
 * Close confirm popup
 */
function closePopupDeleteForm(){
    popupDeleteForm.classList.remove('active');
    overlay.classList.remove('active');
}

/**
 * Add item to UI
 * @param {Todo} task Todo class object
 */
function addToDo(task){
    if(task.isDeleted){
        return;
    }

    const LINE = task.isCompleted ? CROSSED : "";
    const COMPLETED = task.isCompleted ? CHECK : "";

    const text = `
                    <li>
                        <input ${COMPLETED} value job="complete" type="checkbox" id="${task.id}" >
                        <p class="task-delete-btn" job="delete" id="${task.id}">&times;</p>
                        <p class="task-remainingtime-text">${calculateRemainingTime(task.deadline)}</p>
                        <p class="task-text ${LINE}">${task.description}</p>
                    </li>
                `;

    const position = "beforeend";
    
    list.insertAdjacentHTML(position, text);
}

/**
 * Show items to UI
 * @param {Todo[]} array List of todo objects  
 */
function showTodos(array) {
    array.forEach((element) => {
        addToDo(element);
    });
}

/**
 * Delete list item from UI
 * @param {DOMElement} element Clicked element (delete button)  
 */
function deleteToDo(element){
    element.parentNode.parentNode.removeChild(element.parentNode);
    todosList[element.id].isDeleted = true;
    sessionStorage.setItem("todosList", JSON.stringify(todosList)); //Save changes to session
}

/**
 * Mark list item as completed
 * @param {DOMElement} element Clicked element (complete checkbox)
 */
function completeToDo(element){
    element.parentNode.querySelector(".task-text").classList.toggle(CROSSED);
    todosList[element.id].isCompleted = todosList[element.id].isCompleted ? false : true;
    sessionStorage.setItem("todosList", JSON.stringify(todosList)); //Save changes to session
}

//-------------UI RELATED FUNCTIONS END---------------

/**
 * Add new task 
 * @param {string} text Text from input field 
 * @param {datetime} deadline Date and time from datetime-local input field
 */
function addNewTask(text, deadline) {
    //Create new todo object
    let task = new Todo(text, deadline, id, false, false);

    addToDo(task);
    saveTask(task);
    reloadListUI();
}

/**
 * Sort list by deadline. Move completed items to the list end
 */
function sortList(array){
    let completedTodosList = [];
    let remainingTodosList = [];
    let sortedList = [];

    array.forEach(element => {
        if(!element.isDeleted){     //If item was deleted, remove it completly
            if(element.isCompleted){
                completedTodosList.push(element);
            } else {
                remainingTodosList.push(element);
            }
        }
    });
    
    remainingTodosList.sort((a, b) => {
        a = new Date(a.deadline).getTime();
        b = new Date(b.deadline).getTime();
        //If deadline is not set, send it to list back
        if(isNaN(a)){ a = Infinity; }
        if(isNaN(b)){ b = Infinity; }

        return a - b });

    //Merge temporary lists
    sortedList = sortedList.concat(remainingTodosList);
    sortedList = sortedList.concat(completedTodosList);

    resetIDs(sortedList);

    console.log(sortedList);
    return sortedList;
}

/**
 * Use this function when you need to show any changes to UI
 */
function reloadListUI(){
    todosList = sortList(todosList); //Sort todosList
    cleanListUI();                   //Remove UI elements from list
    showTodos(todosList);            //Show UI elements to list
    sessionStorage.setItem("todosList", JSON.stringify(todosList)); //Save to session latest list
}

/**
 * Set todo item id to array position
 * @param {Todo[]} array List of todo object  
 */
function resetIDs(array){
    let newID = 0;
    array.forEach(element => {
        element.id = newID;
        newID++;
    });
}

/**
 * Check if field is empty
 * @param {string} text Field value that needs to be checked
 * Return True if field is empty
 */
function fieldIsEmpty(text){
    //Check field
    if(text.length == 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Add item to todosList and save this list to sessionStorage
 * @param {Todo} task Todo object
 */
function saveTask(task){
    todosList.push(task);
    id++;           //Increase ID, after new item has beed added to todosList
}

/**
 * Save each array item using saveTask() function
 * @param {Todo[]} array List of todo object  
 */
function saveTaskArray(array){
    array.forEach((item) => {
        saveTask(item);
    })
}





/**
 * Returns how many days, hours and minutes left till deadline
 * @param {datetime} datetime Deadline date and time 
 */
function calculateRemainingTime(datetime){
    //Code taken from: https://www.w3schools.com/howto/howto_js_countdown.asp
    // Set the date we're counting down to
    var countDownDate = new Date(datetime).getTime();
    if(isNaN(countDownDate)){
        return NO_DEADLINE;
    }
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    // If the count down is finished, write some text
    if (distance < 0) {
        return EXPIRED;
    }

    // Return results
    return days + "d " + hours + "h "
    + minutes + "m ";
}

