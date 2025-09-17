import React, { useState, useEffect, useRef } from "react";
import { graphql } from '@aws-amplify/api/graphql';
import { createMessage } from './graphql/mutations';
import { onCreateMessage } from './graphql/subscriptions';
import { messagesByDate } from './graphql/queries';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        // Use the new GSI query to fetch messages sorted by the database
        const result = await graphql({
          query: messagesByDate,
          variables: {
            type: 'Message',
            sortDirection: 'ASC'
          }
        });
        // No more client-side sorting needed!
        const sortedMessages = result.data.messagesByDate.items;
        setMessages(sortedMessages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = graphql({
      query: onCreateMessage
    }).subscribe({
      next: ({ provider, value }) => {
        const newMessage = value.data.onCreateMessage;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      },
      error: (error) => console.warn(error)
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat window when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim()) {
      const messageDetails = {
        sender: user.username,
        message: input,
        type: 'Message' // Add the GSI partition key
      };
      await graphql({
        query: createMessage,
        variables: { input: messageDetails }
      });
      setInput("");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Doctor–Staff Chat</h2>
      <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "auto", marginBottom: "1rem", padding: "0.5rem" }}>
        {messages.map((msg, idx) => (
          <div key={msg.id || idx}><strong>{msg.sender}:</strong> {msg.message}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
        style={{ marginRight: "0.5rem" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;