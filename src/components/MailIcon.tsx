import { Mail } from 'lucide-react'

interface MailIconProps {
  className?: string
}

export default function MailIcon({ className }: MailIconProps) {
  return <Mail className={className} />
}