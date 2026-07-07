import React, { useState, useEffect, useCallback } from 'react';
import { getRooms, getMessages, sendMessage, updateMessage, deleteMessage } from '../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatRoom = ({ user, onLogout }) => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [editingMessage, setEditingMessage] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
                if (data.length > 0) setSelectedRoom(data[0]);
            } catch (err) {
                console.error("Failed to fetch rooms", err);
                if (err.response?.status === 401) onLogout();
            }
        };
        fetchRooms();
    }, [onLogout]);

    const fetchMessages = useCallback(async () => {
        if (selectedRoom) {
            try {
                const data = await getMessages(selectedRoom.id, search);
                setMessages(data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        }
    }, [selectedRoom, search]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleSend = async (text) => {
        try {
            if (editingMessage) {
                await updateMessage(editingMessage.id, text);
                setEditingMessage(null);
            } else {
                await sendMessage(selectedRoom.id, text);
            }
            fetchMessages();
        } catch (err) {
            alert("Failed to send message: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleDelete = async (messageId) => {
        if (window.confirm('Delete this message?')) {
            try {
                await deleteMessage(messageId);
                fetchMessages();
            } catch (err) {
                alert("Failed to delete message: " + (err.response?.data?.detail || err.message));
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-800 text-white flex flex-col">
                <div className="p-4 text-xl font-bold border-b border-indigo-700">Rooms</div>
                <nav className="flex-1 overflow-y-auto">
                    {rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`w-full text-left px-4 py-3 hover:bg-indigo-700 transition duration-150 ${selectedRoom?.id === room.id ? 'bg-indigo-900' : ''}`}
                        >
                            # {room.name}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-indigo-700">
                    <div className="text-sm opacity-75 mb-2">Logged in as</div>
                    <div className="font-bold mb-4">{user.username}</div>
                    <button onClick={onLogout} className="text-xs bg-indigo-700 hover:bg-indigo-600 px-2 py-1 rounded transition duration-150">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800"># {selectedRoom?.name || 'Loading...'}</h2>
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                <MessageList
                    messages={messages}
                    currentUserId={user.user_id}
                    onEdit={setEditingMessage}
                    onDelete={handleDelete}
                />

                <MessageInput
                    onSendMessage={handleSend}
                    editingMessage={editingMessage}
                    onCancelEdit={() => setEditingMessage(null)}
                />
            </main>
        </div>
    );
};

export default ChatRoom;
