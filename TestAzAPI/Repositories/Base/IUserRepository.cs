using TestAzAPI.Models;

namespace TestAzAPI.Repositories.Base;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByNameOrSurnameAsync(string nameOrSurname);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsAsync(string email);
}
