namespace TestAzAPI.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

public class TestAzDbContextFactory : IDesignTimeDbContextFactory<TestAzDbContext>
{
    public TestAzDbContext CreateDbContext(string[] args)
    {
        // Read appsettings.json from project directory
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        var optionsBuilder = new DbContextOptionsBuilder<TestAzDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new TestAzDbContext(optionsBuilder.Options);
    }
}