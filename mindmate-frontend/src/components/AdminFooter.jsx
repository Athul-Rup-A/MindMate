import React from 'react';

const AdminFooter = () => {
    return (
        <div className="text-center py-3"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)',
                width: '100%'
            }}
        >
            <small>&copy; {new Date().getFullYear()} MindMate. Empowering Oversight, Enabling Support.</small>
        </div>
    );
};

export default AdminFooter;