namespace TestAzAPI.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Npgsql.EntityFrameworkCore.PostgreSQL;

public class TestAzDbContextFactory : IDesignTimeDbContextFactory<TestAzDbContext>
{
    public TestAzDbContext CreateDbContext(string[] args)
    {
        // Read appsettings.json from project directory
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<TestAzDbContext>();
        optionsBuilder.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));

        return new TestAzDbContext(optionsBuilder.Options);
    }
}