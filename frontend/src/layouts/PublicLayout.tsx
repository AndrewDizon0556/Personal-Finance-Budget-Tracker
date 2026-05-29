import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[rgb(var(--page-bg))] bg-nu-mesh">
      <Outlet />
    </div>
  );
}
