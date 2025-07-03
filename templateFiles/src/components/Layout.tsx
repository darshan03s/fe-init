import { ThemeToggleButton } from "@/features/theme"
import { Link, Outlet } from "react-router-dom"

const Header = () => {
    return (
        <header className="sticky top-0 z-10 flex justify-between items-center h-[var(--header-height)] px-6 py-3 text-foreground dark:text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-background/60 bg-background dark:bg-background border-b border-border/10">
            <div className="logo">
                <Link to="/">Vite App</Link>
            </div>
            <div className="nav">
                <ThemeToggleButton />
            </div>
        </header>
    )
}

const Main = () => {
    return (
        <main className="flex-1">
            <Outlet />
        </main>
    )
}

const Layout = () => {
    return (
        <div className="flex flex-col bg-background dark:bg-background">
            <Header />
            <Main />
        </div>
    )
}

export default Layout