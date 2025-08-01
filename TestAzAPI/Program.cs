using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TestAzAPI.Data;
using TestAzAPI.Repositories;
using TestAzAPI.Repositories.Base;
using TestAzAPI.Services;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using TestAzAPI.Configuration;
using DotNetEnv;
// Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Auth
var jwtKey = Environment.GetEnvironmentVariable("Jwt__Key") ?? throw new InvalidOperationException("JWT Key not found");
var jwtIssuer = Environment.GetEnvironmentVariable("Jwt__Issuer") ?? throw new InvalidOperationException("JWT Issuer not found");
var jwtAudience = Environment.GetEnvironmentVariable("Jwt__Audience") ?? throw new InvalidOperationException("JWT Audience not found");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Rate limiting
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

// JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// DB
builder.Services.AddDbContext<TestAzDbContext>(options =>
{
    var conn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
        ?? throw new InvalidOperationException("DB connection string not found");
    options.UseNpgsql(conn, npgsqlOpts =>
    {
        npgsqlOpts.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
    });
});

// DI
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITestRepository, TestRepository>();
builder.Services.AddScoped<IVideoCourseRepository, VideoCourseRepository>();
builder.Services.AddScoped<IUserSolutionRepository, UserSolutionRepository>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IPremiumRequestRepository, PremiumRequestRepository>();
builder.Services.Configure<KapitalPaySettings>(builder.Configuration.GetSection("KapitalPay"));
builder.Services.Configure<PayriffSettings>(builder.Configuration.GetSection("Payriff"));
builder.Services.AddHttpClient<IKapitalPayService, KapitalPayService>();

var app = builder.Build();

// Migrate DB
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
        logger.LogError(ex, "An error occurred during database migration.");
    }
}

// Swagger (dev only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TestAz API V1");
        c.RoutePrefix = "swagger";
    });
}

// ✅ Enforce HTTPS before everything (in production)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// ✅ CORS must come early and before auth
app.UseCors("AllowAll");

// Security headers (prod)
app.Use(async (context, next) =>
{
    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-Frame-Options"] = "DENY";
        context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
        context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
        context.Response.Headers["Content-Security-Policy"] = "default-src 'self'";
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    }
    await next();
});

// Rate limiting, auth
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Routing
app.MapControllers();
app.MapGet("/ping", () => "pong");
app.MapMethods("/", new[] { "HEAD" }, () => Results.Ok());

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}