using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly TestAzDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(TestAzDbContext context)
    {
        _context = context;
        _dbSet = _context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public void Delete(T entity)
    {
        _dbSet.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
