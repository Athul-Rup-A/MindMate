import React, { useState } from 'react';
import { Button, Offcanvas, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { House, User, Calendar, Heart, MessageCircle, FileText, Bell, Menu, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { icon: <House size={20} />, label: 'Home', path: '/student/home' },
    { icon: <Calendar size={20} />, label: 'Appointments', path: '/student/appointments' },
    { icon: <Heart size={20} />, label: 'VentWall', path: '/student/ventwall' },
    { icon: <FileText size={20} />, label: 'Resource', path: '/student/resource' },
    { icon: <Bell size={20} />, label: 'Feedback', path: '/student/feedback' },
    { icon: <User size={20} />, label: 'Profile', path: '/student/profile' },
  ];

  return (
    <>
      {/* --- Left vertical icon bar --- */}
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
        {/* --- Top Section --- */}
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

        {/* --- Bottom Logout Icon --- */}
        <Button
          variant="link"
          className="mb-3 text-danger"
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut size={22} />
        </Button>
      </div>

      {/* --- Pop-out menu --- */}
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
            Feel ✦ Express ✦ Heal
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

export default StudentSidebar;