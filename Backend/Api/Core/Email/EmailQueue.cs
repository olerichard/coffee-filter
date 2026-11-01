namespace Api.Core.Email
{
  using System.Threading.Channels;

  public interface IEmailQueue
  {
    void Enqueue(EmailMessage message);
  }

  /// <summary>
  /// Keeps SMTP latency and failures out of the request that triggered the
  /// email. The queue is in memory, so a restart drops anything not yet sent;
  /// users can simply request another reset link.
  /// </summary>
  public sealed class EmailQueue : IEmailQueue
  {
    private readonly Channel<EmailMessage> _channel =
      Channel.CreateUnbounded<EmailMessage>(new UnboundedChannelOptions
      {
        SingleReader = true,
        SingleWriter = false
      });

    public ChannelReader<EmailMessage> Reader => _channel.Reader;

    public void Enqueue(EmailMessage message)
    {
      _channel.Writer.TryWrite(message);
    }
  }

  public sealed class EmailDispatcher : BackgroundService
  {
    private readonly EmailQueue _queue;
    private readonly IEmailSender _sender;
    private readonly ILogger<EmailDispatcher> _logger;

    public EmailDispatcher(
      EmailQueue queue,
      IEmailSender sender,
      ILogger<EmailDispatcher> logger)
    {
      _queue = queue;
      _sender = sender;
      _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      try
      {
        await foreach (var message in _queue.Reader.ReadAllAsync(stoppingToken))
        {
          try
          {
            await _sender.SendAsync(message, stoppingToken);
          }
          catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
          {
            return;
          }
          catch (Exception exception)
          {
            _logger.LogError(
              exception,
              "Failed to send \"{Subject}\" to {Recipient}.",
              message.Subject,
              message.ToAddress);
          }
        }
      }
      catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
      {
        // Normal shutdown.
      }
    }
  }
}
