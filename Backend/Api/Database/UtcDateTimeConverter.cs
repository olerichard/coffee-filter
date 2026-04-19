using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Database;

public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        var dateString = reader.GetString();
        if (string.IsNullOrEmpty(dateString))
        {
            return default;
        }

        if (DateTime.TryParse(dateString, out var result))
        {
            return result;
        }

        if (DateTime.TryParseExact(
            dateString,
            "yyyy-MM-ddTHH:mm:ss.ffffff",
            null,
            System.Globalization.DateTimeStyles.AssumeUniversal,
            out result))
        {
            return result;
        }

        throw new JsonException($"Could not parse date: {dateString}");
    }

    public override void Write(
        Utf8JsonWriter writer,
        DateTime value,
        JsonSerializerOptions options)
    {
        var utcValue = value.Kind == DateTimeKind.Local
            ? value.ToUniversalTime()
            : value;

        writer.WriteStringValue(utcValue);
    }
}