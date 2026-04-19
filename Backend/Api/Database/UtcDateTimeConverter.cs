using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Api.Database;

public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    private static readonly Regex HasTimeZoneDesignator = new(
        // Require explicit timezone: trailing Z, +hh:mm, -hh:mm, +hhmm, -hhmm
        @"(Z|[+-]\d{2}:\d{2}|[+-]\d{4})$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public override DateTime Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return default;
        }

        if (reader.TokenType != JsonTokenType.String)
        {
            throw new JsonException($"Expected a JSON string for {typeToConvert.Name}.");
        }

        var dateString = reader.GetString();
        if (string.IsNullOrWhiteSpace(dateString))
        {
            return default;
        }

        // Enforce explicit timezone from the client.
        // This prevents ambiguous interpretation as local time or unspecified.
        if (!HasTimeZoneDesignator.IsMatch(dateString))
        {
            throw new JsonException(
                $"DateTime must include a timezone designator (e.g. 'Z' or '+00:00'). Value='{dateString}'.");
        }

        if (!DateTimeOffset.TryParse(
                dateString,
                CultureInfo.InvariantCulture,
                DateTimeStyles.RoundtripKind,
                out var dto))
        {
            throw new JsonException($"Could not parse DateTime value '{dateString}'.");
        }

        return dto.UtcDateTime;
    }

    public override void Write(
        Utf8JsonWriter writer,
        DateTime value,
        JsonSerializerOptions options)
    {
        // Enforce UTC on the wire.
        // If this ever trips, it means backend code produced an ambiguous DateTime.
        if (value.Kind == DateTimeKind.Unspecified)
        {
            throw new JsonException("DateTime.Kind must be Utc. Backend produced an Unspecified DateTime.");
        }

        var utcValue = value.Kind == DateTimeKind.Utc
            ? value
            : value.ToUniversalTime();

        writer.WriteStringValue(utcValue.ToString("O", CultureInfo.InvariantCulture));
    }
}
