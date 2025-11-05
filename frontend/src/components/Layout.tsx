import { Outlet } from 'react-router-dom';
import { LeftSidebar } from './Sidebar/LeftSidebar';
import { RightSidebar } from './Sidebar/RightSidebar';

export function Layout() {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
