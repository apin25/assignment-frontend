export interface AssignmentInterface{
    id:string
    title:string
    course:string
    owner:string
    createdAt:Date
    modifiedAt:Date
    dueDate:Date
}
export interface AssignmentRequestInterface {
    title:string
    course:string
    owner:string
    dueDate:Date
}
export interface AssignmentRequestUpdateInterface {
    title:string
    course:string
    owner:string
    dueDate:Date
}
export interface AssignmentResponseInterface {
  message: string;
  assignment: AssignmentInterface;
}
