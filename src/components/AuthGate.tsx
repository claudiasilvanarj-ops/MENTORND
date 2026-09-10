import React from 'react';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  return <div>
    <h2>Canalização de Sebastião, organizada e compilada pela tecnologia.</h2>
    {children}
  </div>;
  return <>{children}</>;
};

