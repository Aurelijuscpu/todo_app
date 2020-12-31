//Import javascript classes
import { Todo } from './todo.js';

//HTML input type=checkbox property
const CHECK = "checked";

//Class name 
const CROSSED = "crossed";

//Select the Elements
const addBtn = document.querySelector("#new-task-btn-add");
const list = document.querySelector('#list');
const description = document.querySelector('input[name="new-task-description-text"]');
const datetime = document.querySelector('input[name="new-task-deadline-datetime"]');

//Variables
let todosList = [];
let id = 0;

let data = sessionStorage.getItem("todosList");

// load todo items from session storage, if there are any
if(data){
    getTodosFromSessionStorage(data);
}


//Listener for new task button "Add"
addBtn.addEventListener('click', function(){
    addNewTask(description.value, datetime.value);
})

//Function to process user click on button "Add"
function addNewTask(text, deadline) {

    if(checkFieldIsEmpty(text)){
        alert("Task name is required!");
        return;
    }

    let task = new Todo(text, deadline, id, false, false);

    addToDo(task);
    saveTask(task);

    id++;
    
    description.value = "";
    datetime.value = "";
}

/**
 * Check if field is empty
 * @param {string} text Field value that needs to be checked
 * Return True if field is empty
 */
function checkFieldIsEmpty(text){
    //Check field
    if(text.length == 0) {
        return true;
    } else {
        return false;
    }
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
                        <p class="task-delete-btn" job="delete" id="${task.id}">X</p>
                        <p class="task-remainingtime-text">${calculateRemainingTime(task.deadline)}</p>
                        <p class="task-text ${LINE}">${task.description}</p>
                    </li>
                `;

    const position = "beforeend";
    
    list.insertAdjacentHTML(position, text);
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
 * Add item to todosList and save this list to sessionStorage
 * @param {Todo} task Todo object
 */
function saveTask(task){
    todosList.push(task);
    sessionStorage.setItem("todosList", JSON.stringify(todosList));
}

/**
 * 
 * @param {JSON} data JSON from SessionStorage, stringified todosList array 
 */
function getTodosFromSessionStorage(data){
    let array;

    array = JSON.parse(data);
    saveTaskArray(array);
    loadTodos(array);

    id = todosList.length; //Set id to imported data, to prevent overriding data
}

/**
 * Show items to UI
 * @param {Todo[]} array List of todo objects  
 */
function loadTodos(array) {
    console.log(array);
    array.forEach((element) => {
        addToDo(element);
    });
}

/**
 * Returns how many days, hours and minutes left till deadline
 * @param {datetime} datetime Deadline date and time 
 */
function calculateRemainingTime(datetime){
    //Code taken from: https://www.w3schools.com/howto/howto_js_countdown.asp
    // Set the date we're counting down to
    var countDownDate = new Date(datetime).getTime();

    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    // If the count down is finished, write some text
    if (distance < 0) {
        return "EXPIRED";
    }

    // Return results
    return days + "d " + hours + "h "
    + minutes + "m ";
}

/**
 * Delete list item
 * @param {DOMElement} element Clicked element (delete button)  
 */
function deleteToDo(element){
    element.parentNode.parentNode.removeChild(element.parentNode);

    todosList[element.id].isDeleted = true;
}

/**
 * Mark list item as completed
 * @param {DOMElement} element Clicked element (complete checkbox)
 */
function completeToDo(element){
    element.parentNode.querySelector(".task-text").classList.toggle(CROSSED);

    todosList[element.id].isCompleted = todosList[element.id].isCompleted ? false : true;
}

/**
 * Select dynamically created list's element
 */
list.addEventListener("click", (event) => {
    const element = event.target;
    let elementJob;

    if(element.hasAttribute("job")){
        elementJob = element.attributes.job.value; 
        if(elementJob == "complete") {
            completeToDo(element);
            
        } else if(elementJob == "delete"){
            deleteToDo(element);
        }

        sessionStorage.setItem("todosList", JSON.stringify(todosList));
    } else {
        return;
    }
})