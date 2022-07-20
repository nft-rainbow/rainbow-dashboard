import React from 'react';
import RainbowBreadcrumb from '../../components/Breadcrumb';

function Apps() {
  return (
    <div>
      <RainbowBreadcrumb items={['Apps']} />
      <div className="content-body">
        Apps
      </div>
    </div>
  );
}

export default Apps;
