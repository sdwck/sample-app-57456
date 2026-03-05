import { useState, useEffect } from 'react';
import { type ToDo, type ToDoRequest } from '../types';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useToasts, ToastContainer } from '../components/Toasts';

const API_URL = 'http://localhost:8080/api';

export default function TodosPage() {
    const [todos, setTodos] = useState<ToDo[]>([]);
    const [formData, setFormData] = useState<ToDoRequest>({ title: '', isCompleted: false });
    const [emailTo, setEmailTo] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const { toasts, addToast } = useToasts();

    const handleWsMessage = (event: string, payload: any) => {
        switch (event) {
            case 'created':
                setTodos(prev => [...prev, payload]);
                addToast(`Task added: ${payload.title}`, 'created');
                break;
            case 'updated':
                setTodos(prev => prev.map(t => t.id === payload.id ? payload : t));
                addToast(`Task updated: ${payload.title}`, 'updated');
                break;
            case 'deleted':
                setTodos(prev => prev.filter(t => t.id !== payload.id));
                addToast(`Task #${payload.id} deleted`, 'deleted');
                break;
            case 'connections':
                setOnlineCount(payload.count);
                break;
        }
    };

    const connected = useWebSocket(handleWsMessage);

    useEffect(() => {
        fetch(`${API_URL}/todos`)
            .then(res => res.json())
            .then(setTodos)
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId ? `${API_URL}/todos/${editingId}` : `${API_URL}/todos`;
        const method = editingId ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        setFormData({ title: '', isCompleted: false });
        setEditingId(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return;
        await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    };

    const handleSendEmail = async (id: number) => {
        if (!emailTo) return alert("Enter email first!");
        const res = await fetch(`${API_URL}/todos/${id}/send-email?toEmail=${emailTo}`, { method: "POST" });
        alert(res.ok ? "Sent!" : "Error sending");
    };

    const startEdit = (t: ToDo) => {
        setEditingId(t.id);
        setFormData({ title: t.title, isCompleted: t.isCompleted });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <ToastContainer toasts={toasts} />

            <div className="grid gap-4 mb-6 md:grid-cols-2">
                <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded border border-gray-700">
                    <h3 className="mb-2 font-bold">{editingId ? 'Edit' : 'Add'} Task</h3>
                    <input
                        className="w-full bg-gray-700 border border-gray-600 p-2 rounded mb-2 text-white"
                        placeholder="Title..."
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.isCompleted}
                                   onChange={e => setFormData({ ...formData, isCompleted: e.target.checked })} />
                            <span>Done?</span>
                        </label>
                        <div className="gap-2 flex">
                            <button className="bg-blue-700 px-3 py-1 rounded text-white hover:bg-blue-600 cursor-pointer">Save</button>
                            {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', isCompleted: false }) }} className="bg-gray-600 px-3 py-1 rounded">Cancel</button>}
                        </div>
                    </div>
                </form>

                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                    <h3 className="mb-2 font-bold">Email Config</h3>
                    <input
                        className="w-full bg-gray-700 border border-gray-600 p-2 rounded mb-2 text-white"
                        placeholder="Recipient Email"
                        value={emailTo}
                        onChange={e => setEmailTo(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            <span className="text-xs text-gray-500">{connected ? 'Live sync on' : 'Reconnecting...'}</span>
                        </div>
                        {onlineCount > 0 && (
                            <span className="text-xs text-gray-500">
                                {onlineCount} {onlineCount === 1 ? 'client' : 'clients'} online
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700">
                    <tr>
                        <th className="p-3">Task</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                    {todos.map(t => (
                        <tr key={t.id}>
                            <td className="p-3">
                                <Link to={`/todos/${t.id}`} className={`hover:text-blue-400 ${t.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                    {t.title}
                                </Link>
                            </td>
                            <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${t.isCompleted ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                        {t.isCompleted ? 'Done' : 'Pending'}
                                    </span>
                            </td>
                            <td className="p-3 flex gap-2">
                                <button onClick={() => handleSendEmail(t.id)} className="text-blue-400 bg-blue-900 border border-blue-400 w-8 h-8 rounded cursor-pointer flex items-center justify-center">✉️</button>
                                <button onClick={() => startEdit(t)} className="text-yellow-400 bg-yellow-900 border border-yellow-400 w-8 h-8 rounded cursor-pointer flex items-center justify-center">✏️</button>
                                <button onClick={() => handleDelete(t.id)} className="text-red-400 bg-red-900 border border-red-400 w-8 h-8 rounded cursor-pointer flex items-center justify-center">✕</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {!todos.length && <div className="p-4 text-center text-gray-500">No tasks.</div>}
            </div>
        </div>
    );
}