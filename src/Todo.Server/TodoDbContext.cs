using Microsoft.EntityFrameworkCore;

namespace Todo.Server;

public class TodoDbContext : DbContext
{
    public DbSet<ToDo> Todos { get; set; }

    public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options)
    {
    }
}