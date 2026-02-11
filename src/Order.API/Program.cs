using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseInMemoryDatabase("OrderDb"));
builder.Services.AddHttpClient("StockApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["StockApiUrl"] ?? "http://localhost:8081");
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    db.Database.EnsureCreated();
    
    if (!db.Orders.Any())
    {
        db.Orders.AddRange(
            new Order { Id = 1, ProductId = 1, Quantity = 2, Status = "Completed", CreatedAt = DateTime.UtcNow.AddDays(-5) },
            new Order { Id = 2, ProductId = 2, Quantity = 5, Status = "Pending", CreatedAt = DateTime.UtcNow.AddDays(-2) },
            new Order { Id = 3, ProductId = 3, Quantity = 1, Status = "Completed", CreatedAt = DateTime.UtcNow.AddDays(-1) }
        );
        db.SaveChanges();
    }
}

app.MapOpenApi();
app.MapScalarApiReference();
app.UseCors("AllowAll");

app.MapGet("/orders", async (OrderDbContext db) =>
    await db.Orders.ToListAsync());

app.MapGet("/orders/{id:int}", async (int id, OrderDbContext db) =>
    await db.Orders.FindAsync(id) is { } order
        ? Results.Ok(order)
        : Results.NotFound());

app.MapPost("/orders", async (OrderRequest request, OrderDbContext db, IHttpClientFactory httpClientFactory) =>
{
    var httpClient = httpClientFactory.CreateClient("StockApi");
    
    try
    {
        var response = await httpClient.GetAsync($"/products/{request.ProductId}");
        
        if (!response.IsSuccessStatusCode)
            return Results.BadRequest(new { error = "Product not found in stock" });
        
        var productJson = await response.Content.ReadAsStringAsync();
        var product = JsonSerializer.Deserialize<ProductDto>(productJson, new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true 
        });
        
        if (product == null || product.Quantity < request.Quantity)
            return Results.BadRequest(new { error = "Insufficient stock quantity" });
        
        var order = new Order
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };
        
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        
        return Results.Created($"/orders/{order.Id}", order);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = "Failed to validate stock", details = ex.Message });
    }
});

app.MapPut("/orders/{id:int}", async (int id, OrderUpdateRequest request, OrderDbContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order is null) return Results.NotFound();

    order.Quantity = request.Quantity;
    order.Status = request.Status;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/orders/{id:int}", async (int id, OrderDbContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order is null) return Results.NotFound();

    db.Orders.Remove(order);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options) { }
    public DbSet<Order> Orders { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    [MaxLength(64)]
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public record OrderRequest(int ProductId, int Quantity);
public record OrderUpdateRequest(int Quantity, string Status);
public record ProductDto(int Id, string Name, decimal Price, int Quantity);
