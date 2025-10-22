// src/pages/NotFound.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Illustration / Left */}
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <svg
                            viewBox="0 0 800 600"
                            className="w-full h-auto"
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-labelledby="notFoundTitle notFoundDesc"
                        >
                            <title id="notFoundTitle">404 not found illustration</title>
                            <desc id="notFoundDesc">A simple 404 error page illustration</desc>
                            <rect width="100%" height="100%" fill="transparent" />
                            <g transform="translate(80,40)">
                                <circle cx="280" cy="220" r="120" fill="#EFF6FF" />
                                <path d="M200 320c40-30 120-30 160 0" stroke="#C7D2FE" strokeWidth="18" strokeLinecap="round" fill="none" />
                                <rect x="40" y="40" width="200" height="140" rx="12" fill="#fff" stroke="#E6E9F2" />
                                <rect x="260" y="40" width="320" height="200" rx="12" fill="#fff" stroke="#E6E9F2" />
                                <line x1="280" y1="60" x2="520" y2="60" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round" />
                                <circle cx="470" cy="120" r="18" fill="#FEE2E2" stroke="#FCA5A5" />
                                <text x="80" y="120" fill="#111827" fontSize="36" fontWeight="700">404</text>
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Content / Right */}
                <div className="flex flex-col items-start text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                        Page not found
                    </h1>
                    <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-xl">
                        The page you're looking for doesn’t exist or may have been moved. Please check the URL or return to the homepage.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                        >
                            Go Back
                        </button>

                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                        >
                            Back to Home
                        </Link>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        If you think this is a mistake, please contact support or try again later.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
