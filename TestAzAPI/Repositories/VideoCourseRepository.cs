using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class VideoCourseRepository : Repository<Videocourse>, IVideoCourseRepository
{
    public VideoCourseRepository(TestAzDbContext context) : base(context) { }
}
