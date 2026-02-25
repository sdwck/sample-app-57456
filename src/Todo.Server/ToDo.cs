namespace Todo.Server;

public class ToDo
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}

public record ToDoRequest(string Title, bool IsCompleted);