import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Hranolky from './screens/Hranolky'
import Sparovky from './screens/Sparovky'

function AppRoutes() {
    const location = useLocation();

    useEffect(() => {
        const titles: Record<string, string> = {
            '/hranolky': 'Hranolky Web',
            '/sparovky': 'Spárovky Web',
        };

        const baseTitle = 'JELÍNEK - nábytek a matrace';
        const pageTitle = titles[location.pathname] || 'Hranolky Web';
        document.title = `${pageTitle} | ${baseTitle}`;
    }, [location.pathname]);

    return (
        <Routes>
            <Route path="/" element={<Navigate to="hranolky" replace />} />
            <Route path="hranolky" element={<Hranolky />} />
            <Route path="sparovky" element={<Sparovky />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter basename="/app">
            <AppRoutes />
        </BrowserRouter>
    );
}
