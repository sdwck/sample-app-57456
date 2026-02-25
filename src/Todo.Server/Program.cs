using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Todo.Server;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll",
        p => p.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()));

builder.Services.AddDbContext<TodoDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString(builder.Environment.IsDevelopment() ? "DevEnv" : "DefaultConnection")));

builder.Services.AddScoped<MailService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
    db.Database.Migrate();
}

app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors("AllowAll");
var api = app.MapGroup("/api");

api.MapGet("/todos", async (TodoDbContext db) =>
    await db.Todos.ToListAsync());

api.MapGet("/todos/{id:int}", async (int id, TodoDbContext db) =>
    await db.Todos.FindAsync(id) is { } todo
        ? Results.Ok(todo)
        : Results.NotFound());

api.MapPost("/todos", async (ToDoRequest task, TodoDbContext db) =>
{
    var newTodo = new ToDo
    {
        Title = task.Title,
        IsCompleted = task.IsCompleted
    };
    db.Todos.Add(newTodo);
    await db.SaveChangesAsync();
    return Results.Created($"/todos/{newTodo.Id}", newTodo);
});

api.MapPut("/todos/{id:int}", async (int id, ToDoRequest task, TodoDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null)
        return Results.NotFound();

    todo.Title = task.Title;
    todo.IsCompleted = task.IsCompleted;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

api.MapDelete("/todos/{id:int}", async (int id, TodoDbContext db) =>
{
    if (await db.Todos.FindAsync(id) is not { } todo)
        return Results.NotFound();

    db.Todos.Remove(todo);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

api.MapPost("/todos/{id:int}/send-email", async (int id, string toEmail, TodoDbContext db, MailService mailer) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();

    try
    {
        await mailer.SendEmailAsync(toEmail, "ToDo Reminder",
            $"<h1>ToDo: {todo.Title}</h1><p>Status: {(todo.IsCompleted ? "Completed" : "Not Completed")}</p>");
        return Results.Ok();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

api.MapGet("/mail/inbox", async (MailService mailer) =>
{
    try
    {
        var messages = await mailer.GetRecentMailsImapAsync(5);
        return Results.Ok(new { messages });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

api.MapGet("/mail/pop3-check", async (MailService mailer) =>
{
    try
    {
        var lastMessage = await mailer.GetLastMessageTextPop3Async();
        return Results.Ok(new { lastMessage });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.UseHttpsRedirection();

app.Run();