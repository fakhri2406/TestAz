using TestAzAPI.Models;

namespace TestAzAPI.Repositories.Base;

public interface IPremiumRequestRepository : IRepository<PremiumRequest>
{
    Task<IEnumerable<PremiumRequest>> GetPendingRequestsAsync();
    Task<PremiumRequest?> GetRequestWithUserAsync(Guid id);
} 