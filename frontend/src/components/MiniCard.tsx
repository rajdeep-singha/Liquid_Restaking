import React from 'react';

interface MiniCardProps {
  title: string;
  children: React.ReactNode;
}

const MiniCard: React.FC<MiniCardProps> = ({ title, children }) => (
  <div className="mini-card">
    <div className="mini-card-title">{title}</div>
    <div className="mini-card-body">{children}</div>
  </div>
);

export default MiniCard; 