using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TestAzAPI.Data;
using TestAzAPI.Repositories;
using TestAzAPI.Repositories.Base;
using TestAzAPI.Services;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Npgsql.EntityFrameworkCore.PostgreSQL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found in configuration");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Add CORS
var allowedOrigins = builder.Configuration.GetSection("Security:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMobileApp",
        builder =>
        {
            builder
                .WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithExposedHeaders("Content-Type", "Content-Length", "Content-Disposition", "Authorization");
        });
});

// Add rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// Configure JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddDbContext<TestAzDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<TestAzAPI.Repositories.Base.IUserRepository, UserRepository>();
builder.Services.AddScoped<ITestRepository, TestRepository>();
builder.Services.AddScoped<IVideoCourseRepository, VideoCourseRepository>();
builder.Services.AddScoped<IUserSolutionRepository, UserSolutionRepository>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

// Apply database migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TestAzDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TestAz API V1");
        c.RoutePrefix = string.Empty; // Serve Swagger at root
    });
}

// Important: Use CORS before other middleware
app.UseCors("AllowMobileApp");

// Add security headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

// Add rate limiting middleware
app.UseRateLimiter();

app.UseHttpsRedirection();

// Add authentication middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
