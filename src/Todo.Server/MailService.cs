using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Pop3;
using MailKit.Net.Smtp;
using MailKit.Search;
using MailKit.Security;
using MimeKit;

namespace Todo.Server;

public class MailService
{
    private readonly IConfiguration _config;

    public MailService(IConfiguration config)
    {
        _config = config;
    }

    private string Email => _config["MailSettings:Email"] ?? string.Empty;
    private string Password => _config["MailSettings:Password"] ?? string.Empty;

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("ToDo App", Email));
        email.To.Add(new MailboxAddress("", toEmail));
        email.Subject = subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = htmlMessage };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(Email, Password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
    
    public async Task<List<string>> GetRecentMailsImapAsync(int count)
    {
        using var client = new ImapClient();
        await client.ConnectAsync("imap.gmail.com", 993, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(Email, Password);

        var inbox = client.Inbox;
        await inbox.OpenAsync(FolderAccess.ReadOnly);

        var query = SearchQuery.FromContains(Email);
        var uids = await inbox.SearchAsync(query);

        var results = new List<string>();
        
        for (var i = uids.Count - 1; i >= Math.Max(0, uids.Count - count); i--)
        {
            var message = await inbox.GetMessageAsync(uids[i]);
            results.Add($"[{message.Date.DateTime}] {message.Subject}: {message.TextBody ?? message.HtmlBody ?? string.Empty}");
        }

        await client.DisconnectAsync(true);
        return results;
    }
    
    public async Task<string?> GetLastMessageTextPop3Async()
    {
        using var client = new Pop3Client();
        await client.ConnectAsync("pop.gmail.com", 995, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(Email, Password);

        if (client.Count == 0)
        {
            await client.DisconnectAsync(true);
            return null;
        }

        var message = await client.GetMessageAsync(client.Count - 1);

        await client.DisconnectAsync(true);

        return message.TextBody ?? message.HtmlBody ?? null;
    }
}