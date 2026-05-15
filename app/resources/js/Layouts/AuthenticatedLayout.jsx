import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useCan } from '@/features/rbac/useCan';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { hasPermission, hasRole } = useCan();
    const canViewReports = hasPermission('view_reports');
    const canViewGameManagement =
        hasPermission('games.view') || hasPermission('matches.view') || hasPermission('bets.view');
    const userRoleName = user?.role?.name ?? user?.role_name ?? null;
    const isCashier =
        userRoleName === 'Cashier-Basic' ||
        userRoleName === 'Cashier-Full' ||
        userRoleName === 'Cashier Basic' ||
        userRoleName === 'Cashier Full' ||
        hasRole('Cashier-Basic') ||
        hasRole('Cashier-Full') ||
        hasRole('Cashier Basic') ||
        hasRole('Cashier Full');
    const isAdmin = userRoleName === 'Admin' || hasRole('Admin');
    const canViewSettings =
        hasPermission('settings.roles.view') ||
        hasPermission('settings.permissions.view') ||
        hasPermission('settings.rbac_matrix.view') ||
        isAdmin;

    const getInitialTheme = () => {
        try {
            const t = localStorage.getItem('theme');
            if (t === 'dark' || t === 'light') return t;
        } catch (e) {

        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const [theme, setTheme] = useState(getInitialTheme);
    const [gameMenuOpen, setGameMenuOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {

        }

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {!isCashier && (
                <nav className="relative z-50 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-[var(--text-primary)]" />
                                    </Link>
                                </div>

                                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        Dashboard
                                    </NavLink>

                                    {hasPermission('users.view') && (
                                        <NavLink
                                            href={route('users')}
                                            active={route().current('users')}
                                        >
                                            User Management
                                        </NavLink>
                                    )}

                                    {hasPermission('players.view') && (
                                        <NavLink
                                            href={route('players')}
                                            active={route().current('players')}
                                        >
                                            Players Management
                                        </NavLink>
                                    )}

                                    {hasPermission('cocks.view') && (
                                        <NavLink
                                            href={route('cocks')}
                                            active={route().current('cocks')}
                                        >
                                            Cock Management
                                        </NavLink>
                                    )}

                                    {hasPermission('games.view') && (
                                        <NavLink
                                            href={route('games')}
                                            active={route().current('games')}
                                        >
                                            Game Management
                                        </NavLink>
                                    )}

                                    {(hasPermission('reports.view') || canViewReports) && (
                                        <NavLink
                                            href={route('reports')}
                                            active={route().current('reports')}
                                        >
                                            Reports
                                        </NavLink>
                                    )}
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium leading-4 text-[var(--text-secondary)] transition duration-150 ease-in-out hover:text-[var(--text-primary)] focus:outline-none"
                                    onClick={() =>
                                        setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
                                    }
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M12 1a.75.75 0 01.75.75V4a.75.75 0 01-1.5 0V1.75A.75.75 0 0112 1zm0 19a.75.75 0 01.75.75V23a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 20zm11-8a.75.75 0 01-.75.75H20a.75.75 0 010-1.5h2.25A.75.75 0 0123 12zM4 12a.75.75 0 01-.75.75H1a.75.75 0 010-1.5h2.25A.75.75 0 014 12zm16.28-7.53a.75.75 0 010 1.06l-1.59 1.59a.75.75 0 11-1.06-1.06l1.59-1.59a.75.75 0 011.06 0zM6.91 17.84a.75.75 0 010 1.06l-1.59 1.59a.75.75 0 11-1.06-1.06l1.59-1.59a.75.75 0 011.06 0zm13.37 1.59a.75.75 0 01-1.06 0l-1.59-1.59a.75.75 0 111.06-1.06l1.59 1.59a.75.75 0 010 1.06zM6.91 6.16a.75.75 0 01-1.06 0L4.26 4.57a.75.75 0 111.06-1.06l1.59 1.59a.75.75 0 010 1.06z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M17.293 14.707a8 8 0 01-8-8c0-1.1.222-2.148.625-3.107a.75.75 0 00-1.006-.95A10 10 0 1019.35 15.088a.75.75 0 00-.95-1.006 7.964 7.964 0 01-1.107.625z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>

                                {canViewSettings && (
                                    <div className="relative ms-3">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center rounded-md border border-transparent bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium leading-4 text-[var(--text-secondary)] transition duration-150 ease-in-out hover:text-[var(--text-primary)] focus:outline-none"
                                                    >
                                                        Settings

                                                        <svg
                                                            className="-me-0.5 ms-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                {hasPermission('settings.roles.view') && (
                                                    <Dropdown.Link
                                                        href={route('settings.roles')}
                                                    >
                                                        Roles
                                                    </Dropdown.Link>
                                                )}
                                                {hasPermission('settings.permissions.view') && (
                                                    <Dropdown.Link
                                                        href={route('settings.permissions')}
                                                    >
                                                        Permissions
                                                    </Dropdown.Link>
                                                )}
                                                {hasPermission('settings.rbac_matrix.view') && (
                                                    <Dropdown.Link
                                                        href={route('settings.rbac_matrix')}
                                                    >
                                                        RBAC Matrix
                                                    </Dropdown.Link>
                                                )}
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                )}

                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium leading-4 text-[var(--text-secondary)] transition duration-150 ease-in-out hover:text-[var(--text-primary)] focus:outline-none"
                                                >
                                                    {user.name}

                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) =>
                                                !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-[var(--text-secondary)] transition duration-150 ease-in-out hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus:bg-[var(--bg-tertiary)] focus:text-[var(--text-primary)] focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            (showingNavigationDropdown
                                ? 'block'
                                : 'hidden') + ' sm:hidden'
                        }
                    >
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                            >
                                Dashboard
                            </ResponsiveNavLink>

                            {hasPermission('users.view') && (
                                <ResponsiveNavLink
                                    href={route('users')}
                                    active={route().current('users')}
                                >
                                    User Management
                                </ResponsiveNavLink>
                            )}

                            {hasPermission('players.view') && (
                                <ResponsiveNavLink
                                    href={route('players')}
                                    active={route().current('players')}
                                >
                                    Players Management
                                </ResponsiveNavLink>
                            )}

                            {hasPermission('cocks.view') && (
                                <ResponsiveNavLink
                                    href={route('cocks')}
                                    active={route().current('cocks')}
                                >
                                    Cock Management
                                </ResponsiveNavLink>
                            )}

                            {hasPermission('games.view') && (
                                <ResponsiveNavLink
                                    href={route('games')}
                                    active={route().current('games')}
                                >
                                    Game Management
                                </ResponsiveNavLink>
                            )}

                            {(hasPermission('reports.view') || canViewReports) && (
                                <ResponsiveNavLink
                                    href={route('reports')}
                                    active={route().current('reports')}
                                >
                                    Reports
                                </ResponsiveNavLink>
                            )}
                        </div>

                        <div className="border-t border-[var(--border)] pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-[var(--text-primary)]">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-[var(--text-secondary)]">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink
                                    href={route('profile.edit')}
                                >
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {!isCashier && header && (
                <header className="relative z-0 bg-[var(--bg-secondary)] shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
