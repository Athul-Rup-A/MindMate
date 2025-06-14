import React from 'react';

const studentFooter = () => {
    return (
        <div className="text-center py-3 mt-5 bg-light border-top">
            <small>&copy; {new Date().getFullYear()} MindMate. All rights reserved.</small>
        </div>
    );
};

export default studentFooter;