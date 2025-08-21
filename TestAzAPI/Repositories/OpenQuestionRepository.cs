using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class OpenQuestionRepository : BaseRepository<OpenQuestion>, IOpenQuestionRepository
{
    public OpenQuestionRepository(TestAzDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<OpenQuestion>> GetByTestIdAsync(Guid testId)
    {
        return await _context.OpenQuestions
            .Where(oq => oq.TestId == testId)
            .ToListAsync();
    }

    public async Task<OpenQuestion?> GetWithTestAsync(Guid id)
    {
        return await _context.OpenQuestions
            .Include(oq => oq.Test)
            .FirstOrDefaultAsync(oq => oq.Id == id);
    }
}