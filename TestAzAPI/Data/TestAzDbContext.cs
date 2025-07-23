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
    public DbSet<VideoCourse> VideoCourses { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<PremiumRequest> PremiumRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>()
            .Property(u => u.IsPremium)
            .HasDefaultValue(false);
        modelBuilder.Entity<User>()
            .Property(u => u.Id)
            .ValueGeneratedOnAdd();

        // Configure Subscription entity
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.User)
            .WithMany(u => u.Subscriptions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Add decimal precision to avoid silent truncation warnings
        modelBuilder.Entity<Subscription>()
            .Property(s => s.Amount)
            .HasPrecision(18, 2);

        // Configure UserSolution entity
        modelBuilder.Entity<UserSolution>()
            .HasOne(us => us.User)
            .WithMany(u => u.Solutions)
            .HasForeignKey(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserSolution>()
            .HasOne(us => us.Test)
            .WithMany(t => t.UserSolutions)
            .HasForeignKey(us => us.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Question entity
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Test)
            .WithMany(t => t.Questions)
            .HasForeignKey(q => q.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure UserAnswer entity
        modelBuilder.Entity<UserAnswer>()
            .HasOne(ua => ua.UserSolution)
            .WithMany(us => us.Answers)
            .HasForeignKey(ua => ua.UserSolutionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserAnswer>()
            .HasOne(ua => ua.Question)
            .WithMany(q => q.UserAnswers)
            .HasForeignKey(ua => ua.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure AnswerOption entity
        modelBuilder.Entity<AnswerOption>()
            .HasOne(ao => ao.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(ao => ao.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Test>()
            .Property(t => t.Id)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Question>()
            .Property(q => q.Id)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<AnswerOption>()
            .Property(a => a.Id)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<UserSolution>()
            .Property(us => us.Id)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<UserAnswer>()
            .Property(ua => ua.Id)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<VideoCourse>()
            .Property(vc => vc.Id)
            .ValueGeneratedOnAdd();
    }
}
