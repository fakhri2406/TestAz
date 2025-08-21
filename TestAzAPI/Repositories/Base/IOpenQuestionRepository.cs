using TestAzAPI.Models;

namespace TestAzAPI.Repositories.Base;

public interface IOpenQuestionRepository : IBaseRepository<OpenQuestion>
{
    Task<IEnumerable<OpenQuestion>> GetByTestIdAsync(Guid testId);
    Task<OpenQuestion?> GetWithTestAsync(Guid id);
}