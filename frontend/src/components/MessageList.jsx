import React from 'react';

const MessageList = ({ messages, currentUserId, onEdit, onDelete }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.user_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${msg.user_id === currentUserId ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800'}`}>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs font-bold mr-2">{msg.author_name}</span>
                            <span className="text-[10px] opacity-75">{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm break-words">{msg.message}</p>
                        {msg.user_id === currentUserId && (
                            <div className="mt-2 flex justify-end space-x-2 text-[10px]">
                                <button onClick={() => onEdit(msg)} className="hover:underline">Edit</button>
                                <button onClick={() => onDelete(msg.id)} className="hover:underline text-red-200">Delete</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;
