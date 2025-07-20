import React from 'react';
import { useLocation } from 'react-router-dom';

const StudentFooter = () => {
    const location = useLocation();

    const isResourcePage = location.pathname === '/student/resource';

    return (
        <div className="text-center py-3"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)',
                width: '100%',
                color: isResourcePage ? 'white' : 'black',
            }}
        >
            <small>&copy; {new Date().getFullYear()} MindMate. Nurture Your Mind, Safely.</small>
        </div>
    );
};

export default StudentFooter;