using System.Globalization;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Api.Database;

// SQLite (and EF) do not persist DateTimeKind.
// These converters enforce UTC at the database boundary and store values as ISO 8601 with 'Z'.
public sealed class UtcDateTimeValueConverter : ValueConverter<DateTime, string>
{
  public UtcDateTimeValueConverter()
    : base(
      convertToProviderExpression: value => ToProvider(value),
      convertFromProviderExpression: value => FromProvider(value))
  {
  }

  private static string ToProvider(DateTime value)
  {
    if (value.Kind != DateTimeKind.Utc)
    {
      throw new InvalidOperationException(
        $"DateTime.Kind must be Utc when persisting. Got {value.Kind}.");
    }

    return value.ToString("O", CultureInfo.InvariantCulture);
  }

  private static DateTime FromProvider(string value)
  {
    // Stored format is round-trip ISO 8601 with timezone ('Z').
    // Parse as DateTimeOffset and normalize to UTC DateTime.
    var dto = DateTimeOffset.Parse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
    return dto.UtcDateTime;
  }
}

public sealed class UtcNullableDateTimeValueConverter : ValueConverter<DateTime?, string?>
{
  public UtcNullableDateTimeValueConverter()
    : base(
      convertToProviderExpression: value => value == null ? null : ToProvider(value.Value),
      convertFromProviderExpression: value => value == null ? null : FromProvider(value))
  {
  }

  private static string ToProvider(DateTime value)
  {
    if (value.Kind != DateTimeKind.Utc)
    {
      throw new InvalidOperationException(
        $"DateTime.Kind must be Utc when persisting. Got {value.Kind}.");
    }

    return value.ToString("O", CultureInfo.InvariantCulture);
  }

  private static DateTime FromProvider(string value)
  {
    var dto = DateTimeOffset.Parse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
    return dto.UtcDateTime;
  }
}
