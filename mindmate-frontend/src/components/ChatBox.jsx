import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Form, InputGroup, Dropdown } from "react-bootstrap";
import { Check, CheckCheck } from "lucide-react";
import socket from "../config/socket";
import axioInstance from '../config/axios';

const ChatBox = ({ myId, targetId, isInCall, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    console.log("Target ID being used:", targetId);
    if (myId) {
      console.log("Joining my room:", myId);
      socket.emit('join', myId);
    }

    socket.on('receiveMessage', (msg) => {

      setMessages((prev) => {
        const exists = prev.find(m => m._id === msg._id || (m.text === msg.text && m.timestamp === msg.timestamp && m.from === msg.from));
        if (exists) return prev;

        const isMine = msg.self || msg.from === myId;
        const receivedMsg = {
          ...msg,
          self: isMine,
          timestamp: msg.timestamp || new Date().toISOString(), // Fallback
        };
        return [...prev, receivedMsg];
      });
    });

    socket.on("messageDeleted", (deletedId) => {
      setMessages((prev) => prev.filter(msg => msg._id !== deletedId));
    });

    socket.on("messageEdited", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? { ...m, ...updatedMsg } : m))
      );
    });

    const fetchName = async () => {
      try {
        console.log("🔎 Fetching chat target name");

        let isStudent = false;
        let res;

        try {
          const who = await axioInstance.get('/whoami');
          const myRole = who.data.role;
          isStudent = myRole === 'student';
          console.log("✅ Logged in as:", myRole);
        } catch (err) {
          console.error("❌ Failed to determine user role via /whoami:", err);
        }

        if (isStudent) {
          res = await axioInstance.get(`students/counselorPsychologist/${targetId}`);
          setTargetName(res.data.FullName || res.data.Username || 'Counselor');
          setTargetRole(res.data.Role || '');
        } else {
          res = await axioInstance.get(`counselorPsychologist/students/${targetId}`);
          setTargetName(res.data.Username || 'Student');
          setTargetRole('Student');
        }
      } catch (err) {
        console.error('❌ Failed to fetch chat target name:', err);
        setTargetName('User');
      }
    };

    fetchChatHistory();
    fetchName();

    return () => {
      socket.off('receiveMessage');
      socket.off('messageDeleted');
    }
  }, [myId, targetId]);

  const sendMessage = () => {
    if (!newMsg.trim() || isInCall) return;

    const capitalized = newMsg.charAt(0).toUpperCase() + newMsg.slice(1);

    const msg = {
      to: targetId,
      from: myId,
      text: capitalized,
      timestamp: new Date().toISOString(),
    };

    socket.emit('sendMessage', msg);
    setNewMsg('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const res = await axioInstance.get(`/chat/${myId}/${targetId}`);
      const history = res.data.map(msg => ({
        ...msg,
        self: msg.from === myId,
        //  if it's my message, check if THEY have seen it
        seen: msg.from === myId
          ? msg.seenBy?.includes(targetId)
          : msg.seenBy?.includes(myId) // for consistency, you may track if I saw it
      }));
      setMessages(history);

    } catch (err) {
      console.error("❌ Failed to load chat history:", err);
    }
  };

  const filteredMessages = searchTerm
    ? messages.filter((msg) =>
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : messages;

  // Emit messageSeen when the latest incoming msg is viewed
  useEffect(() => {
    if (filteredMessages.length > 0) {
      const lastMsg = filteredMessages[filteredMessages.length - 1];

      // Only mark as seen if it's from the other user and not already seen
      if (!lastMsg.self && !lastMsg.seen) {
        socket.emit("messageSeen", { messageId: lastMsg._id, userId: myId });
      }
    }
  }, [filteredMessages, myId]);

  // Listen for seen updates from server
  useEffect(() => {
    socket.on("messageSeenUpdate", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, seen: true } : m))
      );
    });

    return () => {
      socket.off("messageSeenUpdate");
    };
  }, []);

  // Check if message is deletable (within 24 hours)
  const canDeleteMessage = (timestamp) => {
    try {
      const msgTime = new Date(timestamp);
      const now = new Date();
      const diffMs = now - msgTime;
      const diffHrs = diffMs / (1000 * 60 * 60);
      return diffHrs <= 24;
    } catch (err) {
      return false;
    }
  };

  // Delete the message at index i
  const deleteMessage = async (index) => {
    console.log(index);

    const msgToDelete = messages[index];

    if (!msgToDelete) return;
    if (!msgToDelete._id) {
      alert("This message hasn’t been saved yet. Please wait or refresh.");
      return;
    }

    const confirm = window.confirm("Are you sure you want to delete this message?");
    if (!confirm) return;

    try {
      await axioInstance.delete(`/chat/${msgToDelete._id}`);

      // Emit socket event so other side removes it live
      socket.emit("deleteMessage", {
        _id: msgToDelete._id,
        from: myId,
        to: targetId,
      });

      setMessages((prev) => prev.filter((_, i) => i !== index));
      console.log(messages);


    } catch (err) {
      console.error("❌ Failed to delete message:", err);
      alert("Failed to delete message.");
    }
  };

  const saveEdit = async (id, newText) => {
    try {
      const res = await axioInstance.put(`/chat/${id}`, { text: newText });

      setMessages((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, text: res.data.text, edited: true } : m
        )
      );

      // Also notify the other user:
      socket.emit("editMessage", res.data);

    } catch (err) {
      console.error("❌ Failed to edit message:", err);
      alert("Failed to edit message.");
    }
  };

  return (
    <Card style={{ maxWidth: '400px', margin: '20px auto', position: 'relative' }}>
      {onClose && (
        <Button
          variant="light"
          size="sm"
          onClick={onClose}
          style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 1 }}
        >
          ❌
        </Button>
      )}
      <Card.Header>
        💬 Chat with {targetName}
        {targetRole && targetRole.toLowerCase() !== 'student' && ` (${targetRole})`}
      </Card.Header>

      <InputGroup size="sm" className="mb-2">
        <Form.Control
          placeholder="🔍 Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>Clear</Button>
        )}
      </InputGroup>

      <Card.Body style={{ maxHeight: '250px', overflowY: 'scroll', background: 'white' }}>

        {filteredMessages.length === 0 ? (
          <div className="text-muted text-center mt-3">No messages</div>
        ) : (
          filteredMessages.map((msg, i) => {
            let time = '';
            let date = '';
            try {
              if (msg.timestamp) {
                const dateObj = new Date(msg.timestamp);
                if (!isNaN(dateObj)) {
                  time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  date = dateObj.toLocaleDateString();
                }
              }
            } catch (err) {
              console.error("Invalid timestamp:", msg.timestamp);
            }

            return (
              <div key={i}
                style={{ textAlign: msg.self ? 'right' : 'left', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: msg.self ? 'flex-end' : 'flex-start', marginBottom: "8px", }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: msg.self ? '#d1e7dd' : '#f1f1f1',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      maxWidth: '75%',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                    }}>
                      <span><strong>{msg.self ? 'You' : targetName.split(' ')[0]}:</strong> {msg.text}</span>
                      {msg.self && canDeleteMessage(msg.timestamp) && (
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            as="button"
                            style={{
                              background: "transparent",
                              height: '15px',
                              width: '20px',
                              border: "none",
                              padding: "0 5px",
                              marginLeft: "6px",
                              boxShadow: "none",
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => {
                                const newText = prompt("Edit your message:", msg.text);
                                if (newText && newText.trim()) {
                                  saveEdit(msg._id, newText);
                                }
                              }}
                              className="text-primary"
                            >
                              ✍️ Edit
                            </Dropdown.Item>

                            <Dropdown.Divider style={{ margin: "4px 0" }} />

                            <Dropdown.Item
                              onClick={() => deleteMessage(i)}
                              className="text-danger"
                            >
                              ❌ Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                  </div>
                </div>
                {(time || date) && (
                  <small style={{ color: '#888' }}>
                    {date} • {time}
                    {msg.self && (
                      msg.seen ? (
                        <CheckCheck size={16} color="blue" style={{ marginLeft: "5px" }} /> // Seen (double blue tick)
                      ) : (
                        <Check size={16} color="gray" style={{ marginLeft: "5px" }} /> // Sent (single gray tick)
                      )
                    )}
                  </small>
                )}

              </div>
            );
          })
        )}
        <div ref={bottomRef} /> {/* Automatic bottom scroll */}
      </Card.Body>

      <Card.Footer className="d-flex">
        <Form.Control
          type="text"
          value={newMsg}
          onChange={(e) => {
            const val = e.target.value;
            // Capitalize only the first letter
            if (val.length === 1) {
              setNewMsg(val.toUpperCase());
            } else {
              setNewMsg(val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={isInCall}
          placeholder={isInCall ? 'Chat disabled during call' : 'Type a message...'}
        />
        <Button onClick={sendMessage} disabled={isInCall || !newMsg.trim()} variant="primary" className="ms-2">
          Send
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ChatBox;