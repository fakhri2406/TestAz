using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class TestRepository : Repository<Test>, ITestRepository
{
    public TestRepository(TestAzDbContext context) : base(context) { }

    public async Task<Test?> GetTestWithQuestionsAsync(Guid testId)
    {
        return await _dbSet
            .Include(t => t.Questions!)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(t => t.Id == testId);
    }
}
