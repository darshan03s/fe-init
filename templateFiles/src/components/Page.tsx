import { cn } from "@/lib/utils"

interface PageProps {
    className?: string
    children: React.ReactNode
}

const Page = ({ className, children }: PageProps) => {
    return (
        <div className={cn("h-[calc(100vh-var(--header-height))]", className)}>
            {children}
        </div>
    )
}

export default Page