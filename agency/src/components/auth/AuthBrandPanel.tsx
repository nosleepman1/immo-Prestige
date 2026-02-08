import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface BrandHighlight {
  icon: ReactNode
  title: string
  description: string
}

/**
 * The left half of the auth screens: mark, promise, and three things the space
 * actually does.
 *
 * Hidden below lg rather than stacked above the form — on a phone it would push
 * the sign-in fields below the fold, making people scroll to reach the only
 * thing they opened the page for.
 */
export function AuthBrandPanel({
  badge,
  name,
  title,
  lead,
  highlights,
  footer,
}: {
  badge: ReactNode
  name: string
  title: string
  lead: string
  highlights: BrandHighlight[]
  footer: string
}) {
  return (
    <aside className="auth-brand">
      <motion.div
        className="auth-brand-content"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      >
        <div className="auth-brand-mark">
          <span className="auth-brand-badge">{badge}</span>
          {name}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="auth-brand-title">{title}</h2>
          <p className="auth-brand-lead">{lead}</p>
        </div>

        <ul className="auth-brand-list">
          {highlights.map((highlight, index) => (
            <motion.li
              key={highlight.title}
              className="auth-brand-item"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
            >
              <span className="auth-brand-item-icon">{highlight.icon}</span>
              <span>
                <strong className="block font-semibold text-foreground">{highlight.title}</strong>
                <span className="text-muted-foreground">{highlight.description}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <p className="auth-brand-footer">{footer}</p>
    </aside>
  )
}

export default AuthBrandPanel
