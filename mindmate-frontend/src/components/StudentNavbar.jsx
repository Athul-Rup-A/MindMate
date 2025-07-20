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

  const [dispAlias, setDispAlias] = useState('');
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [studentId, setStudentId] = useState('');
  const studentIdRef = useRef(null);

  const [unreadMessages, setUnreadMessages] = useState({});

  const location = useLocation();
  const isResourcePage = location.pathname === '/student/resource';

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  useEffect(() => {

    const fetchAlias = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, authHeader());
        const alias = res.data?.AliasId || '';
        const first = alias.split(' ')[0];
        const capFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        setDispAlias(capFirst(first));

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
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/counselors'}/${counselorId}`,
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
        });
      } catch (err) {
        console.error('Failed to fetch student alias');
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

    fetchAlias();
    fetchMyCounselors();

    // Set up listener exactly once, outside async
    const handleIncomingCall = ({ from }) => {
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
        zIndex: 1000,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      }}>
      <h4 className="m-0">
        {dispAlias ? (
          <>
            {dispAlias}'s • <span className='text-light'>MindMate</span>
          </>
        ) : (
          "Your's • MindMate"
        )}
      </h4>

      <div className="d-md-none">
        <Button variant="outline-dark" size="sm"
          style={{
            padding: '4px 10px'
          }}
          onClick={() => setShowMenu(true)}>
        </Button>
      </div>

      <div className="d-none d-md-flex gap-5 ms-auto">
        <Button variant='link' size="sm"
          className={`text-decoration-none ${isResourcePage ? 'text-light' : 'text-dark'}`}
          style={location.pathname === '/student/home' ? { borderBottom: '2px solid black' } : {}}
          onClick={() => navigate('/student/home')}>Home</Button>
        <Button variant="link" size="sm"
          className={`text-decoration-none ${isResourcePage ? 'text-light' : 'text-dark'}`}
          style={location.pathname === '/student/profile' ? { borderBottom: '2px solid black' } : {}}
          onClick={() => navigate('/student/profile')}>Profile</Button>
        <Button variant="link" size="sm"
          className={`text-decoration-none ${isResourcePage ? 'text-light' : 'text-dark'}`}
          style={location.pathname === '/student/appointments' ? { borderBottom: '2px solid black' } : {}}
          onClick={() => navigate('/student/appointments')}>Appointments</Button>

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
            {chatCounselors.map(c => (
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

        <Button variant={isResourcePage ? 'light' : 'dark'} size="sm" onClick={() => setShowMenu(true)}>Menu</Button>
      </div>

      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fs-4">
            {dispAlias ? `${dispAlias}'s • Space` : 'Navigation'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column gap-2">
          <Button className="d-md-none"
            variant={location.pathname === '/student/home' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/home');
              setShowMenu(false);
            }}>Home</Button>
          <Button className="d-md-none"
            variant={location.pathname === '/student/profile' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/profile');
              setShowMenu(false);
            }}>Profile</Button>
          <Button className="d-md-none"
            variant={location.pathname === '/student/appointments' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/appointments');
              setShowMenu(false);
            }}>Appointments</Button>

          <Button variant={location.pathname === '/student/ventwall' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/ventwall');
              setShowMenu(false);
            }}>VentWall</Button>
          <Button variant={location.pathname === '/student/wellness' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/wellness');
              setShowMenu(false);
            }}>Wellness</Button>
          <Button variant={location.pathname === '/student/resource' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/resource');
              setShowMenu(false);
            }}>Resource</Button>
          <Button variant={location.pathname === '/student/feedback' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/feedback');
              setShowMenu(false);
            }}>Feedback</Button>
          <Button variant={location.pathname === '/student/report' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/report');
              setShowMenu(false);
            }}>Reporting</Button>
          <Button variant={location.pathname === '/student/sos' ? 'light' : 'outline-dark'}
            onClick={() => {
              navigate('/student/sos');
              setShowMenu(false);
            }}>SOS</Button>
          <Button variant="danger" onClick={() => setShowLogoutModal(true)}>Logout</Button>
        </Offcanvas.Body>

        <div className="mt-auto text-center small pt-2 pb-2 border-top">
          Feel ✦ Express ✦ Heal
        </div>

      </Offcanvas>

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header className="justify-content-center border-0">
          <Modal.Title className="text-center w-100">Are you sure you want to log out?</Modal.Title>
        </Modal.Header>
        <Modal.Footer className="d-flex flex-column gap-2">
          <Button className="w-50" variant="danger" onClick={() => {
            localStorage.removeItem('token');
            navigate('/', { replace: true });
            window.history.pushState(null, '', window.location.href);
            window.onpopstate = () => {
              window.history.pushState(null, '', window.location.href);
            };
          }}>Logout</Button>
          <Button className="w-50" variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

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