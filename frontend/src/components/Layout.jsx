import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, MessageSquare, List, Columns, Globe } from 'lucide-react';
import { useStore } from '../stores/useStore';
import logo from '../assets/logo.png';

export default function Layout() {
    const location = useLocation();
    const { language, setLanguage } = useStore();

    const navItems = [
        { name: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', path: '/', icon: Home },
        { name: language === 'hi' ? 'सहायक चैट' : 'Assistant', path: '/chat', icon: MessageSquare },
        { name: language === 'hi' ? 'योजनाएं' : 'Schemes', path: '/schemes', icon: List },
        { name: language === 'hi' ? 'तुलना' : 'Compare', path: '/compare', icon: Columns },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="flex items-center space-x-2">
                                <img src={logo} alt="Jan Sahayak Logo" className="h-10 w-auto" />
                                <span className="text-xl font-bold tracking-tight text-gray-900">
                                    जन Sahayak
                                </span>
                            </span>
                        </div>

                        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path !== '/' && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex relative group">
                                <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600 p-2 rounded-md hover:bg-gray-50">
                                    <Globe className="w-4 h-4" />
                                    <span>{language === 'hi' ? 'हिंदी' : 'English'}</span>
                                </button>
                                <div className="absolute top-10 right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 hidden group-hover:block ring-1 ring-black ring-opacity-5">
                                    <button onClick={() => setLanguage('hi')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">हिंदी</button>
                                    <button onClick={() => setLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className="sm:hidden border-t">
                    <div className="flex justify-around px-2 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center p-2 rounded-md text-xs font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mb-1" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Jan Sahayak. AI-Powered Government Scheme Assistant.
                    </p>
                </div>
            </footer>
        </div>
    );
}
