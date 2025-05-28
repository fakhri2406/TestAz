using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class UserSolutionRepository : Repository<UserSolution>, IUserSolutionRepository
{
    public UserSolutionRepository(TestAzDbContext context) : base(context) { }

    public async Task<IEnumerable<UserSolution>> GetUserSolutionsWithAnswersAsync(Guid userId)
    {
        return await _dbSet
            .Include(s => s.Answers)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();
    }

    public async Task<UserSolution?> GetUserSolutionWithDetailsAsync(Guid id)
    {
        return await _dbSet
            .Include(s => s.Answers)
            .Include(s => s.Test)
                .ThenInclude(t => t.Questions)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(s => s.Id == id);
    }
}
