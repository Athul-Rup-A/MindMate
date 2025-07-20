import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import StudentFooter from '../components/StudentFooter';

const StudentLayout = () => {
    const location = useLocation();

    // Route-to-background mapping
    const backgroundMap = {
        '/student/profile': '/pngtree-abstract.jpg',
        '/student/appointments': '/pastel.jpg',
        '/student/home': '/pngtree-co.jpg',
        '/student/ventwall': '/poly.avif',
        '/student/feedback': '/low.avif',
        '/student/sos': '/abst.png',
        '/student/wellness': '/pho.avif',
        '/student/resource': '/Blue.png',
        '/student/report': '/Gpt1.png',
    };

    // Get background for current path or fallback
    const backgroundUrl = backgroundMap[location.pathname] || '/pngtree-abstract.jpg';

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: `url("${backgroundUrl}")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
            }}
        >
            <StudentNavbar />

            <div style={{ flex: '1', paddingTop: '45px', paddingBottom: '45px' }}>
                <Outlet />
            </div>

            <StudentFooter />
        </div>
    );
};

export default StudentLayout;