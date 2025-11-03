import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Button, Offcanvas, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Calendar, Bell, FileText, Menu, LogOut, ClockPlus, Clock, } from 'lucide-react';
import LogoutModal from '../components/LogoutModal';

const CounselorPsychologistSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('counselorPsychologist/profile');
        const fullName = res.data?.FullName || '';
        setFirstName(fullName.split(' ')[0]);
      } catch (err) {
        console.error('Error fetching counselor profile');
      }
    };
    fetchProfile();
  }, []);

  const menuItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/counselorpsychologist/stats' },
    { icon: <Calendar size={20} />, label: 'Appointments', path: '/counselorpsychologist/appointments' },
    { icon: <ClockPlus size={20} />, label: 'Availability', path: '/counselorpsychologist/availability' },
    { icon: <FileText size={20} />, label: 'Resources', path: '/counselorpsychologist/resource' },
    { icon: <Bell size={20} />, label: 'Feedbacks', path: '/counselorpsychologist/feedback' },
    { icon: <User size={20} />, label: 'Profile', path: '/counselorpsychologist/profile' },
  ];

  return (
    <>
      {/* --- Left Sidebar --- */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '60px',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(25px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          zIndex: 1000,
          padding: '15px 0',
        }}
      >
        {/* --- Top icons --- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <Button
            variant="link"
            onClick={() => setShowMenu(true)}
            style={{
              color: '#333',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#007bff')}
            onMouseLeave={(e) => (e.target.style.color = '#333')}
          >
            <Menu size={22} />
          </Button>

          {menuItems.map((item, index) => (
            <OverlayTrigger
              key={index}
              placement="right"
              overlay={<Tooltip>{item.label}</Tooltip>}
            >
              <Button
                variant="link"
                style={{
                  color: location.pathname === item.path ? '#007bff' : '#333',
                }}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
              </Button>
            </OverlayTrigger>
          ))}
        </div>

        {/* --- Logout icon --- */}
        <Button
          variant="link"
          className="mb-3 text-danger"
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut size={22} />
        </Button>
      </div>

      {/* --- Offcanvas Menu --- */}
      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Mind_Mate_</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column gap-3">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={location.pathname === item.path ? 'dark' : 'outline-dark'}
              className="d-flex align-items-center gap-2"
              onClick={() => {
                navigate(item.path);
                setShowMenu(false);
              }}
            >
              {item.icon} {item.label}
            </Button>
          ))}
          <Button variant="danger" onClick={() => setShowLogoutModal(true)}>
            Logout
          </Button>
          <div className="mt-auto text-center small pt-2 pb-2 border-top">
            Empathy ✦ Support ✦ Guidance
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default CounselorPsychologistSidebar;