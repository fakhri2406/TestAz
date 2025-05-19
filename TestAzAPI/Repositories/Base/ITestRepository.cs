using TestAzAPI.Models;

namespace TestAzAPI.Repositories.Base;

public interface ITestRepository : IRepository<Test>
{
    Task<Test?> GetTestWithQuestionsAsync(Guid testId);
}
