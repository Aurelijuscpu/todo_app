//Class for To-Do task objects
export class Todo{
    constructor(description, deadline, id, isCompleted, isDeleted){
        this.description = description;     //Task description
        this.deadline = deadline;           //Task deadline date and time
        this.id = id;                       //Task id
        this.isCompleted = isCompleted;     //True if task is marked as completed
        this.isDeleted = isDeleted;         //True if task was clicked to delete
    }
}