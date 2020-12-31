//Class for To-Do task objects
export class Todo{
    constructor(description, deadline, id, isCompleted, isDeleted){
        this.description = description;
        this.deadline = deadline;
        this.id = id;
        this.isCompleted = isCompleted;
        this.isDeleted = isDeleted;
    }
}