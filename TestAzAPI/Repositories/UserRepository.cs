using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(TestAzDbContext context) : base(context) { }

    public async Task<User?> GetByNameOrSurnameAsync(string nameOrSurname)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Name == nameOrSurname || u.Surname == nameOrSurname);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }
    public async Task<bool> ExistsAsync(string email)
    {
        return await _dbSet.AnyAsync(u => u.Email == email);
    }


}
