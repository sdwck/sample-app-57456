import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { type ToDo } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = 'http://localhost:8080/api';

export default function TodoDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [todo, setTodo] = useState<ToDo | null>(null);
    const [flash, setFlash] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/todos/${id}`)
            .then(res => res.json())
            .then(data => setTodo(data))
            .catch(console.error);
    }, [id]);

    const handleWsMessage = (event: string, payload: any) => {
        const numId = Number(id);
        if (event === 'updated' && payload.id === numId) {
            setTodo(payload);
            setFlash('updated');
            setTimeout(() => setFlash(null), 2000);
        }
        if (event === 'deleted' && payload.id === numId) {
            setFlash('deleted');
            setTimeout(() => navigate('/'), 2000);
        }
    };

    useWebSocket(handleWsMessage);

    if (!todo) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10">
            {flash === 'updated' && (
                <div className="mb-4 bg-blue-900 border border-blue-500 text-blue-200 px-4 py-2 rounded text-sm animate-slide-in">
                    This task was just updated by another client
                </div>
            )}
            {flash === 'deleted' && (
                <div className="mb-4 bg-red-900 border border-red-500 text-red-200 px-4 py-2 rounded text-sm animate-slide-in">
                    This task was deleted — redirecting...
                </div>
            )}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Task Details</h2>

                <div className="space-y-4 mb-8">
                    <div>
                        <span className="text-gray-500 text-sm uppercase tracking-wider">ID</span>
                        <p className="text-xl font-mono text-gray-300">#{todo.id}</p>
                    </div>

                    <div>
                        <span className="text-gray-500 text-sm uppercase tracking-wider">Title</span>
                        <p className="text-2xl text-white font-medium">{todo.title}</p>
                    </div>

                    <div>
                        <span className="text-gray-500 text-sm uppercase tracking-wider">Status</span>
                        <div className="mt-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${todo.isCompleted ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                {todo.isCompleted ? 'Completed' : 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                <Link to="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition">
                    Back
                </Link>
            </div>
        </div>
    );
}