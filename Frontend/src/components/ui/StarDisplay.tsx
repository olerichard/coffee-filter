import { StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarDisplayProps {
  value: number
  className?: string
}

export function StarDisplay({ value, className }: StarDisplayProps) {
  return (
    <div className={cn('flex justify-center shrink-0 px-4', className)} aria-label={`Rating: ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1
        const isFilled = rating <= value
        return (
          <div key={rating} className="p-2 rounded-full">
            <StarIcon
              className={cn(
                'size-8 md:size-10',
                isFilled ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'
              )}
            />
          </div>
        )
      })}
    </div>
  )
}