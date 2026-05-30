import Link from 'next/link'

interface StatsCardProps {
  title: string
  value: number
  icon: 'users' | 'calendar' | 'check-circle'
  color: 'blue' | 'green' | 'purple'
  href?: string
}

const iconPaths = {
  users:
    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  calendar:
    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'check-circle':
    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
}

const colorStyles = {
  blue: {
    icon: 'text-[#8d4f31]',
    iconBg: 'bg-[#f2dec8]',
  },
  green: {
    icon: 'text-[#6d7f46]',
    iconBg: 'bg-[#eaf0da]',
  },
  purple: {
    icon: 'text-[#7c614f]',
    iconBg: 'bg-[#efe3d6]',
  },
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  href,
}: StatsCardProps) {
  const styles = colorStyles[color]

  const content = (
    <div className="warm-surface p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center`}
      >
        <svg
          className={`w-6 h-6 ${styles.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={iconPaths[icon]}
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-[#7c6d62]">{title}</p>
        <p className="text-3xl font-bold text-[#3f342d] mt-0.5">{value}</p>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
