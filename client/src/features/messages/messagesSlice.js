import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = { messages: [] };

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async ({ token, userId }) => {
    const { data } = await api.post('/api/message/get', { to_user_id: userId }, { headers: { Authorization: `Bearer ${token}` } });
    return data.success ? data : null;
})

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages = [...state.messages, action.payload];
        },
        resetMessages: (state) => {
            state.messages = [];
        },
        updateMessage: (state, action) => {
            const update = action.payload;
            state.messages = state.messages.map((msg) => {
                if (msg._id === update._id) {
                    // Mark as unsent
                    if (update.isUnsent || update.deleted) {
                        return { ...msg, text: "Message unsent", isUnsent: true, deleted: true };
                    }
                    // Hide for current user
                    if (update.hidden) {
                        return null;
                    }
                    
                    // Corrected logic for editing/correcting
                    // If the updated message has a `text` field, it means the original sender edited it
                    if (update.text) {
                        return { ...msg, ...update, text: update.text, edited: true };
                    }
                    // If it has a `corrections` array, it means the receiver corrected it
                    if (update.corrections) {
                        return { ...msg, ...update, corrections: update.corrections };
                    }
                    
                    return { ...msg, ...update };
                }
                return msg;
            }).filter(Boolean);
        },
        removeMessage: (state, action) => {
            const id = action.payload;
            state.messages = state.messages.filter((msg) => msg._id !== id);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            if (action.payload) {
                state.messages = action.payload.messages;
            }
        })
    }
})

export const { setMessages, addMessage, resetMessages, updateMessage, removeMessage } = messagesSlice.actions;
export default messagesSlice.reducer;