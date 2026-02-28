import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
                <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
                    Page not found
                </h2>
                <p className="mt-2 text-base text-gray-500 max-w-sm mx-auto">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>
                <div className="mt-8 flex justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
