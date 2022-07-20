import React from 'react';
import RainbowBreadcrumb from '../components/Breadcrumb';

function UserManagement() {
  return (
    <div>
      <RainbowBreadcrumb items={['User']} />
      <div className="content-body">
        UserManagement
      </div>
    </div>
  );
}

export default UserManagement;
