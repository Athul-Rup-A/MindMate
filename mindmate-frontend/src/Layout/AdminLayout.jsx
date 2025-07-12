import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AdminFooter from '../components/AdminFooter';

const AdminLayout = () => {
    const location = useLocation();

    // Route-to-background mapping
    const backgroundMap = {
        '/admin/stat': '/pngtree-abstract.jpg',
        '/admin/profile': '/geo.jpg',
        '/admin/approval': '/pngtree-co.jpg',
        '/admin/adminmanage': '/pastel.jpg',
        '/admin/content': '/abst.png',
        '/admin/report': '/Gpt1.png',
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
            <AdminNavbar />
            <div style={{ flex: '1', paddingTop: '45px', paddingBottom: '40px' }}>
                <Outlet />
            </div>

            <AdminFooter />
        </div>
    );
};

export default AdminLayout;