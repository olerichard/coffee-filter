import { useState } from 'react'
import { StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarSelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function StarSelector({ value, onChange, className }: StarSelectorProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const handleClick = (rating: number) => {
    if (rating !== value) {
      onChange(rating)
    }
  }

  return (
    <div
      className={cn('flex justify-center shrink-0 px-4', className)}
      role="group"
      aria-label="Rate this brew"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1
        const isFilled = rating <= (hoverValue || value)
        return (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(0)}
            className="p-2 cursor-pointer transition-colors hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
            aria-label={`Rate ${rating} out of 5`}
          >
            <StarIcon
              className={cn(
                'size-8 md:size-10 transition-colors',
                isFilled ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}