import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useSelector } from 'react-redux';

const NotFoundPage = () => {
    const user = useSelector((state) => state.auth.user);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(8,145,178,0.14),_transparent_55%)]" />

            <section className="relative z-10 max-w-lg text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Page not found
                </p>
                <h1 className="mt-4 text-8xl font-bold leading-none text-white sm:text-9xl">404</h1>
                <p className="mt-6 text-2xl font-semibold text-slate-100">We can’t find that page</p>
                <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-400">
                    The page may have moved, or the address may be incorrect.
                </p>
                <Link
                    to={ROUTES.LOGIN}
                    className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Go to {user ? 'Dashboard' : 'Login'}
                </Link>
            </section>
        </main>
    )
};

export default NotFoundPage;