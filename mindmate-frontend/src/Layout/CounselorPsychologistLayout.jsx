import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CounselorPsychologistNavbar from '../components/CounselorPsychologistNavbar';
import CounselorPsychologistFooter from '../components/CounselorPsychologistFooter';
import CounselorPsychologistSidebar from '../components/CounselorPsychologistSidebar';

const CounselorPsychologistLayout = () => {
    const location = useLocation();

    // Route-to-background mapping
    const backgroundMap = {
        '/counselorpsychologist/profile': '/pngtree-abstract.jpg',
        '/counselorpsychologist/appointments': '/pie.jpg',
        '/counselorpsychologist/availability': '/pngtree-co.jpg',
        '/counselorpsychologist/feedback': '/pastel.jpg',
        '/counselorpsychologist/sos': '/abst.png',
        '/counselorpsychologist/resource': '/Gpt1.png',
        '/counselorpsychologist/wellness': '/Gpt1.png',
        '/counselorpsychologist/stats': '/pastel.jpg',
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
            <CounselorPsychologistNavbar />

            <div style={{ display: 'flex', flex: 1, paddingBottom: '45px' }}>
                <div style={{ width: '65px', flexShrink: 0 }}>
                    <CounselorPsychologistSidebar />
                </div>

                <div style={{ flex: '1', paddingTop: '45px', paddingBottom: '40px' }}>
                    <Outlet />
                </div>
            </div>

            <CounselorPsychologistFooter />
        </div>
    );
};

export default CounselorPsychologistLayout;