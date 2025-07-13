import React from 'react';

const CounselorPsychologistFooter = () => {
    return (
        <div className="text-center py-3"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)',
                width: '100%'
            }}
        >
            <small>&copy; {new Date().getFullYear()} MindMate. Empowering Care, Inspiring Change.</small>
        </div>
    );
};

export default CounselorPsychologistFooter;