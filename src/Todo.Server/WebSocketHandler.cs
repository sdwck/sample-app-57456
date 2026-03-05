using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace Todo.Server;

public static class WebSocketHandler
{
    private static readonly ConcurrentDictionary<string, WebSocket> Sockets = new();

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static int ConnectionCount => Sockets.Count;

    public static async Task Handle(WebSocket socket)
    {
        var id = Guid.NewGuid().ToString();
        Sockets.TryAdd(id, socket);

        await BroadcastConnectionCount();

        var buffer = new byte[256];
        try
        {
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(buffer, CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close) break;
            }
        }
        finally
        {
            Sockets.TryRemove(id, out _);
            if (socket.State is WebSocketState.Open or WebSocketState.CloseReceived)
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
            await BroadcastConnectionCount();
        }
    }

    public static Task BroadcastCreated(ToDo todo) =>
        Broadcast(new WsMessage("created", todo));

    public static Task BroadcastUpdated(ToDo todo) =>
        Broadcast(new WsMessage("updated", todo));

    public static Task BroadcastDeleted(int id) =>
        Broadcast(new WsMessage("deleted", new { id }));

    private static Task BroadcastConnectionCount() =>
        Broadcast(new WsMessage("connections", new { count = ConnectionCount }));

    private static async Task Broadcast(WsMessage message)
    {
        var json = JsonSerializer.Serialize(message, JsonOpts);
        var bytes = Encoding.UTF8.GetBytes(json);

        List<string> dead = [];

        foreach (var (id, socket) in Sockets)
        {
            if (socket.State == WebSocketState.Open)
            {
                try
                {
                    await socket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch
                {
                    dead.Add(id);
                }
            }
            else
            {
                dead.Add(id);
            }
        }

        foreach (var id in dead)
            Sockets.TryRemove(id, out _);
    }
}

public record WsMessage(string Event, object Payload);