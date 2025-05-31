using System.Linq.Expressions;

namespace TestAzAPI.Repositories.Base;

public interface IBaseRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(Guid id);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task SaveAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
} 