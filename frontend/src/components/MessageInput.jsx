import React, { useState, useEffect } from 'react';

const MessageInput = ({ onSendMessage, editingMessage, onCancelEdit }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.message);
        } else {
            setText('');
        }
    }, [editingMessage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex items-center">
            <input
                type="text"
                className="flex-1 border rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-r-md hover:bg-indigo-700 transition duration-200"
            >
                {editingMessage ? 'Update' : 'Send'}
            </button>
            {editingMessage && (
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                    Cancel
                </button>
            )}
        </form>
    );
};

export default MessageInput;
