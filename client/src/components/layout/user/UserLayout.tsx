import { Outlet } from "react-router-dom";

const UserLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
}
export default UserLayout;