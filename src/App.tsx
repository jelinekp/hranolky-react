import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Hranolky from './screens/Hranolky'
import Sparovky from './screens/Sparovky'

export default function App() {
    return (
        <BrowserRouter basename="/app">
            <Routes>
                <Route path="/" element={<Navigate to="hranolky" replace />} />
                <Route path="hranolky" element={<Hranolky />} />
                <Route path="sparovky" element={<Sparovky />} />
            </Routes>
        </BrowserRouter>
    )
}