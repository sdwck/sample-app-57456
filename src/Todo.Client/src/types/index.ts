export interface ToDo {
    id: number;
    title: string;
    isCompleted: boolean;
}

export interface ToDoRequest {
    title: string;
    isCompleted: boolean;
}

export interface MailInboxResponse {
    messages: string[];
}

export interface Pop3Response {
    lastMessage: string | null;
}