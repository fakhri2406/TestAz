using Microsoft.EntityFrameworkCore;
using TestAzAPI.Data;
using TestAzAPI.Models;
using TestAzAPI.Repositories.Base;

namespace TestAzAPI.Repositories;

public class VideoCourseRepository : BaseRepository<VideoCourse>, IVideoCourseRepository
{
    public VideoCourseRepository(TestAzDbContext context) : base(context)
    {
    }

    // Add any specific video course repository methods here
}
