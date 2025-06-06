using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class PremiumRequestRepository : Repository<PremiumRequest>, IPremiumRequestRepository
{
    public PremiumRequestRepository(TestAzDbContext context) : base(context) { }

    public async Task<IEnumerable<PremiumRequest>> GetPendingRequestsAsync()
    {
        return await _dbSet
            .Include(r => r.User)
            .Where(r => r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<PremiumRequest?> GetRequestWithUserAsync(Guid id)
    {
        return await _dbSet
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
} 