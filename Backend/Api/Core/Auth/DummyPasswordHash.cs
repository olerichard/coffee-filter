namespace Api.Core.Auth
{
  using Api.Database.Entities;
  using Microsoft.AspNetCore.Identity;
  using Microsoft.Extensions.Options;

  public sealed class DummyPasswordHash
  {
    public DummyPasswordHash(IOptions<PasswordHasherOptions> options)
    {
      var hasher = new PasswordHasher<UserEntity>(options);
      Value = hasher.HashPassword(null!, Guid.NewGuid().ToString("N"));
    }

    public string Value { get; }
  }
}
