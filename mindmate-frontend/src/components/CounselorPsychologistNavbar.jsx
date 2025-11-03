import React, { useState, useEffect } from 'react';
import axios from '../config/axios'
import { Button, Offcanvas, Modal, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import socket from '../config/socket';

const CounselorPsychologistNavbar = () => {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const [students, setStudents] = useState([]);
    const [chatWithStudentId, setChatWithStudentId] = useState('');
    const [showChatBox, setShowChatBox] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(() => {
        const stored = localStorage.getItem('unreadMessages');
        return stored ? JSON.parse(stored) : {};
    });
    const [counselorId, setCounselorId] = useState('');

    useEffect(() => {
        const fetchName = async () => {
            try {
                const res = await axios.get('counselorPsychologist/profile');
                setCounselorId(res.data._id);

                const fullName = res.data?.FullName || '';
                const first = fullName.split(' ')[0];
                const capFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                setFirstName(capFirst(first));

                const studentsRes = await axios.get('counselorPsychologist/my-students');
                setStudents(studentsRes.data);

            } catch (err) {
                console.error('Failed to fetch name');
            }
        };

        fetchName();
    }, []);

    useEffect(() => {
        if (counselorId) {
            socket.emit('join', counselorId);
            console.log("📡 Joined counselor room:", counselorId);
        }
    }, [counselorId]);

    useEffect(() => {
        if (students.length === 0 || !counselorId) return;

        const handleReceive = (msg) => {
            console.log('🔴 Message received from:', msg.from);
            console.log('👥 Known students:', students.map((s) => s._id));

            if (!showChatBox || chatWithStudentId !== msg.from) {
                if (students.some((s) => s._id === msg.from)) {

                    setUnreadMessages(prev => {
                        const updated = {
                            ...prev,
                            [msg.from]: (prev[msg.from] || 0) + 1
                        };
                        localStorage.setItem('unreadMessages', JSON.stringify(updated));
                        return updated;
                    });
                }
            }
        };

        socket.on('receiveMessage', handleReceive);

        return () => {
            socket.off('receiveMessage', handleReceive);
        };
    }, [students, chatWithStudentId, counselorId]);

    useEffect(() => {
        localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages));
    }, [unreadMessages]);

    return (
        <div className="d-flex justify-content-between align-items-center p-3 text-dark shadow-sm flex-wrap"
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
            }}
        >
            <h4 className="m-0">
                {firstName ? (
                    <>
                        {firstName} • <span style={{ color: 'white' }}>MindMentor</span>
                    </>
                ) : (
                    <span style={{ color: 'white' }}>MindMentor</span>
                )}
            </h4>

            <div className="d-none d-md-flex gap-4 ms-auto">

                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Form.Select
                        size="sm"
                        className="w-auto"
                        style={{ minWidth: '93px' }}
                        value={chatWithStudentId}
                        onChange={(e) => {
                            const selectedId = e.target.value;

                            if (selectedId) {
                                setChatWithStudentId(selectedId);
                                setShowChatBox(true);

                                setUnreadMessages((prev) => {
                                    const updated = { ...prev, [selectedId]: 0 };
                                    localStorage.setItem('unreadMessages', JSON.stringify(updated));
                                    return updated;
                                });
                            }
                        }}
                    >
                        <option value="">💬 Chat</option>
                        {[...students]
                            .sort((a, b) => (unreadMessages[b._id] || 0) - (unreadMessages[a._id] || 0))
                            .map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.Username}
                                    {(unreadMessages[s._id] ?? 0) > 0 ? ` (${unreadMessages[s._id]})` : ''}
                                </option>
                            ))}
                    </Form.Select>

                    {/* Red dot */}
                    {students.some(s => (unreadMessages[s._id] ?? 0) > 0) && (
                        <span style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            height: '8px',
                            width: '8px',
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            display: 'inline-block'
                        }} />
                    )}

                </div>
            </div>

            {showChatBox && chatWithStudentId && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    maxWidth: '300px'
                }}>
                    <ChatBox
                        myId={counselorId}
                        targetId={chatWithStudentId}
                        onClose={() => {
                            setShowChatBox(false);
                            setChatWithStudentId('');
                        }}
                    />
                </div>
            )}

        </div>
    );
};

export default CounselorPsychologistNavbar;