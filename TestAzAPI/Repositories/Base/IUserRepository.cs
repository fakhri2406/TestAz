using TestAzAPI.Models;

namespace TestAzAPI.Repositories.Base;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByNameOrSurnameAsync(string nameOrSurname);
}
