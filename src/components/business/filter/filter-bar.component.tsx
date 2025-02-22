'use client'

export function FilterBarComponent({ children, className, ...props }: any) {
  return (
    <div className="flex flex-1 justify-left rounded-lg border border-dashed shadow-sm p-4 gap-3 max-h-fit">
        {children}
    </div>
  )
}
