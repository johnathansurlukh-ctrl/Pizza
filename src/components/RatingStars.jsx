export default function RatingStars({ rating, size = 'md' }) {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-white/20'}>
          ★
        </span>
      ))}
      <span className={`ml-1 text-white/50 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{rating.toFixed(1)}</span>
    </div>
  )
}
