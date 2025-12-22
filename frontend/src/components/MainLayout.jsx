import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function MainLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirige al login después de cerrar sesión
    };

    return (
        <>
            <nav className="main-nav">
                <div className="nav-links">
                    <NavLink to="/" end>Crear Registro</NavLink>
                    {/* --- 1. AQUÍ ESTÁ EL NUEVO ENLACE AL CALENDARIO --- */}
                    <NavLink to="/calendario">Calendario</NavLink>
                    <NavLink to="/catalogo">Catálogo</NavLink>
                    <NavLink to="/asientos">Asientos</NavLink>
                    <NavLink to="/cuentas-t">Cuentas T</NavLink>
                    <NavLink to="/balance">Balance</NavLink>
                    <NavLink to="/estado-resultados">Estado de Resultados</NavLink>
                </div>
                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </nav>
            
            <main>
                <Outlet />
            </main>
        </>
    );
}

export default MainLayout;

