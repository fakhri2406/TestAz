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

    public async Task<IEnumerable<Question>> GetTestQuestionsAsync(Guid testId)
    {
        return await _context.Questions
            .Include(q => q.Options)
            .Where(q => q.TestId == testId)
            .OrderBy(q => q.Id)  // Maintain consistent order
            .ToListAsync();
    }
}
