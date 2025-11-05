import { Outlet } from 'react-router-dom';
import { LeftSidebar } from './Sidebar/LeftSidebar';
import { RightSidebar } from './Sidebar/RightSidebar';
import { TabBar } from './Tabs/TabBar';

export function Layout() {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <TabBar />

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
