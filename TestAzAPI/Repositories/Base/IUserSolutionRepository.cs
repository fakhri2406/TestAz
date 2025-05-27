using TestAzAPI.Models;

namespace TestAzAPI.Repositories.Base;

public interface IUserSolutionRepository : IRepository<UserSolution>
{
    Task<IEnumerable<UserSolution>> GetUserSolutionsWithAnswersAsync(Guid userId);
    Task<UserSolution?> GetUserSolutionWithDetailsAsync(Guid id);
}
