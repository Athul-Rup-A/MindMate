import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Button, Offcanvas, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authHeader from '../config/authHeader';
import socket from '../config/socket';
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ChatBox from './ChatBox';

const StudentNavbar = ({ counselorId }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [counselorName, setCounselorName] = useState('');
  const [chatCounselors, setChatCounselors] = useState([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState('');

  const [dispUsername, setDispUsername] = useState('');
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const studentIdRef = useRef(null);

  const [unreadMessages, setUnreadMessages] = useState({});

  const location = useLocation();
  const isResourcePage = location.pathname === '/student/resource';

  const BASE_URL = `${import.meta.env.VITE_API_URL}students`;

  useEffect(() => {

    socket.connect();

    // temporary join placeholder until username loads
    socket.emit("join", "student-temp");

    const fetchUsername = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, authHeader());
        const username = res.data?.Username || '';
        const first = username.split(' ')[0];
        const capFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        setDispUsername(capFirst(first));

        const id = res.data._id;
        setStudentId(id);

        const savedUnread = localStorage.getItem('unreadMessages');
        if (savedUnread) {
          try {
            setUnreadMessages(JSON.parse(savedUnread)); // Restore state
          } catch (e) {
            console.error('🔴 Failed to parse unreadMessages from storage');
          }
        }

        if (counselorId) {
          try {
            const counselorRes = await axios.get(
              `${import.meta.env.VITE_API_URL / counselorPsychologist}/${counselorId}`,
              authHeader()
            );
            setCounselorName(counselorRes.data.FullName || 'Counselor');
          } catch (err) {
            console.error('❌ Failed to fetch counselor name');
            setCounselorName('Counselor');
          }
        }

        studentIdRef.current = id;
        console.log("🟢 Student joining room with ID:", id);
        socket.emit('join', id); //  Join room

        socket.on('receiveMessage', (msg) => {
          console.log("📩 Received message:", msg);
          console.log("🧠 Selected Counselor:", selectedCounselorId);

          // Ignore noti if message is from self
          if (msg.from === studentIdRef.current) return;
          const fromId = msg.from;

          // If chat is not open with this counselor, count it as unread
          if (!showChat || selectedCounselorId !== fromId) {
            const updated = {
              ...unreadMessages,
              [fromId]: (unreadMessages[fromId] || 0) + 1
            };
            localStorage.setItem('unreadMessages', JSON.stringify(updated));
            setUnreadMessages(updated); // Don't count if already chatting
          }
          fetchUsername();
        });
      } catch (err) {
        console.error('Failed to fetch student username');
      }
    }

    const fetchMyCounselors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/my-counselors`, authHeader());
        setChatCounselors(res.data);
        console.log(res.data);

      } catch (err) {
        console.error('❌ Failed to fetch counselors for chat');
      }
    };

    fetchUsername();
    fetchMyCounselors();

    // Set up listener exactly once, outside async
    const handleIncomingCall = ({ from, signalData }) => {
      console.log("📞 Incoming call from counselor:", from);
      const accept = window.confirm('📞 Incoming call from your counselor. Do you want to accept?');
      const id = studentIdRef.current;

      if (accept && id) {
        console.log("🔀 Navigating to student video call with ID:", id);
        navigate(`/video/student/${id}`);
      } else {
        navigate('/student/home');
      }
    };

    socket.on('incomingCall', handleIncomingCall);

    return () => {
      socket.off('incomingCall', handleIncomingCall); // Clean up listener only, don't disconnect whole socket here
      socket.off('receiveMessage');
    };
  }, [showChat, selectedCounselorId]);

  return (
    <div className="d-flex justify-content-between align-items-center p-3 shadow-sm flex-wrap"
      style={{
        backgroundColor: 'transparent',
        top: 0,
        left: '60px',
        right: 0,
        height: '70px',
        display: 'flex',
        marginLeft: '60px',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      }}>
      <h4 className="m-0">
        {dispUsername ? (
          <>
            {dispUsername}'s • <span className='text-primary'>MindMate</span>
          </>
        ) : (
          "Your's • MindMate"
        )}
      </h4>

      <div className='d-flex gap-5'>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Form.Select
            size="sm"
            style={{ maxWidth: '93px' }}
            value={selectedCounselorId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedCounselorId(id);
              if (id) {
                setShowChat(true);
                setUnreadMessages(prev => {
                  const updated = { ...prev, [id]: 0 };
                  localStorage.setItem('unreadMessages', JSON.stringify(updated)); // ✅ Reset from storage too
                  return updated;
                });
              }
            }}
          >
            <option value="">💬Chat</option>
            {[...chatCounselors]
              .sort((a, b) => (unreadMessages[b._id] || 0) - (unreadMessages[a._id] || 0))
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.FullName} ({c.Role})
                  {(unreadMessages?.[c._id] ?? 0) > 0 ? ` (${unreadMessages[c._id]})` : ''}
                </option>
              ))}
          </Form.Select>

          {/* Red Dot Notification on Dropdown */}
          {Object.values(unreadMessages).some(count => count > 0) && (
            <span style={{
              position: 'absolute',
              top: '3px',
              right: '3px',
              height: '8px',
              width: '8px',
              backgroundColor: 'red',
              borderRadius: '50%',
              display: 'inline-block',
            }} />
          )}
        </div>

      </div>

      {showChat && selectedCounselorId && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <ChatBox
            myId={studentId}
            targetId={selectedCounselorId}
            isInCall={isInCall}
            onClose={() => {
              setShowChat(false);
              setSelectedCounselorId('');
            }}
          />
        </div>
      )}

    </div>
  );
};

export default StudentNavbar;