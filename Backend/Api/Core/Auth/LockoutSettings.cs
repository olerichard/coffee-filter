namespace Api.Core.Auth
{
  public class LockoutSettings
  {
    public const string SectionName = "Lockout";

    public int MaxFailedAttempts { get; set; } = 5;
    public int DurationMinutes { get; set; } = 15;
  }
}
