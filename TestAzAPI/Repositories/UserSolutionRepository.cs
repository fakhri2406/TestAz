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
            .Where(us => us.UserId == userId)
            .Include(us => us.Answers)
            .Include(us => us.Test)
            .ToListAsync();
    }
}
