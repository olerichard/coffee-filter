using Api.Database.Entities;

public class User
{
    public int Id { get; init; }
    public string Username { get; init; }
    public string Email { get; init; }
    public string? DisplayName { get; init; }
    public bool IsActive { get; init; }
    public DateTime? LastLoginAt { get; init; }

    public User(UserEntity userEntity)
    {
        if (userEntity == null)
            throw new ArgumentException("UserEntity cannot be null");
        if (userEntity.Id <= 0)
            throw new ArgumentException("UserEntity.Id must be greater than 0");
        if (string.IsNullOrWhiteSpace(userEntity.Username))
            throw new ArgumentException("UserEntity.Username cannot be null or empty");
        if (string.IsNullOrWhiteSpace(userEntity.Email))
            throw new ArgumentException("UserEntity.Email cannot be null or empty");
        if (!userEntity.Email.Contains('@'))
            throw new ArgumentException("UserEntity.Email must be a valid email address");

        Id = userEntity.Id;
        Username = userEntity.Username;
        Email = userEntity.Email;
        DisplayName = userEntity.DisplayName;
        IsActive = userEntity.IsActive;
        LastLoginAt = userEntity.LastLoginAt;
    }
}