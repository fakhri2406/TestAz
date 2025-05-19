using Microsoft.EntityFrameworkCore;
using TestAzAPI.Models;

namespace TestAzAPI.Data;

public class TestAzDbContext : DbContext
{
    public TestAzDbContext(DbContextOptions<TestAzDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Test> Tests { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<AnswerOption> AnswerOptions { get; set; }
    public DbSet<UserSolution> UserSolutions { get; set; }
    public DbSet<UserAnswer> UserAnswers { get; set; }
    public DbSet<Videocourse> Videocourses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UserSolution -> User (default cascade is fine)
        modelBuilder.Entity<UserSolution>()
            .HasOne(us => us.User)
            .WithMany(u => u.Solutions)
            .HasForeignKey(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Question -> Test (default cascade is fine)
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Test)
            .WithMany(t => t.Questions)
            .HasForeignKey(q => q.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        // AnswerOption -> Question (default cascade is fine)
        modelBuilder.Entity<AnswerOption>()
            .HasOne(ao => ao.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(ao => ao.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserAnswer -> UserSolution (disable cascade to avoid multiple cascade paths)
        modelBuilder.Entity<UserAnswer>()
            .HasOne(ua => ua.UserSolution)
            .WithMany(us => us.Answers)
            .HasForeignKey(ua => ua.UserSolutionId)
            .OnDelete(DeleteBehavior.Restrict);

        // UserAnswer -> Question (disable cascade to avoid multiple cascade paths)
        modelBuilder.Entity<UserAnswer>()
            .HasOne(ua => ua.Question)
            .WithMany(q => q.UserAnswers)
            .HasForeignKey(ua => ua.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // UserSolution -> Test (default cascade is fine)
        modelBuilder.Entity<UserSolution>()
            .HasOne(us => us.Test)
            .WithMany()
            .HasForeignKey(us => us.TestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
