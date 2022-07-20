import React from 'react';
import RainbowBreadcrumb from '../components/Breadcrumb';

function Dashboard() {
  return (
    <div>
      <RainbowBreadcrumb items={['Dashboard']} />
      <div className="content-body">
        Dashboard
      </div>
    </div>
  );
}

export default Dashboard;
