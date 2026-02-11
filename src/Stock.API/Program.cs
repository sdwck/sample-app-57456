using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<StockDbContext>(options =>
    options.UseInMemoryDatabase("StockDb"));

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
    var db = scope.ServiceProvider.GetRequiredService<StockDbContext>();
    db.Database.EnsureCreated();
    
    if (!db.Products.Any())
    {
        db.Products.AddRange(
            new Product { Id = 1, Name = "Laptop", Price = 1200.00m, Quantity = 15 },
            new Product { Id = 2, Name = "Mouse", Price = 25.50m, Quantity = 50 },
            new Product { Id = 3, Name = "Keyboard", Price = 75.00m, Quantity = 30 },
            new Product { Id = 4, Name = "Monitor", Price = 350.00m, Quantity = 20 },
            new Product { Id = 5, Name = "Headphones", Price = 85.00m, Quantity = 40 }
        );
        db.SaveChanges();
    }
}

app.MapOpenApi();
app.MapScalarApiReference();
app.UseCors("AllowAll");

app.MapGet("/products", async (StockDbContext db) =>
    await db.Products.ToListAsync());

app.MapGet("/products/{id:int}", async (int id, StockDbContext db) =>
    await db.Products.FindAsync(id) is { } product
        ? Results.Ok(product)
        : Results.NotFound());

app.MapPost("/products", async (ProductRequest product, StockDbContext db) =>
{
    var newProduct = new Product
    {
        Name = product.Name, 
        Price = product.Price, 
        Quantity = product.Quantity
    };
    db.Products.Add(newProduct);
    await db.SaveChangesAsync();
    return Results.Created($"/products/{newProduct.Id}", newProduct);
});

app.MapPut("/products/{id:int}", async (int id, ProductRequest inputProduct, StockDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    product.Name = inputProduct.Name;
    product.Price = inputProduct.Price;
    product.Quantity = inputProduct.Quantity;

    await db.SaveChangesAsync();
    return Results.Ok(product);
});

app.MapDelete("/products/{id:int}", async (int id, StockDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    db.Products.Remove(product);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

public class StockDbContext : DbContext
{
    public StockDbContext(DbContextOptions<StockDbContext> options) : base(options) { }
    public DbSet<Product> Products => Set<Product>();
}

public class Product
{
    public int Id { get; set; }
    [MaxLength(512)]
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

record ProductRequest(string Name, decimal Price, int Quantity);