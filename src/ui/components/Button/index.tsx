/*eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": true }]*/
import Link from 'next/link'
import styles from './styles.module.scss'

export type IButtonProps = {
  children: React.ReactNode
  url?: string
  handleClick?: (...args: any[]) => void
  as: 'button' | 'link'
  background?: 'primary' | 'secondary'
  color?: 'white' | 'black'
}

const Button = ({
  children,
  as,
  url,
  handleClick,
  background = 'primary',
  color = 'white'
}: IButtonProps) => {
  return (
    <div className={styles.btn}>
      {as === 'link' && (
        <Link href={url}>
          <a
            className={`${
              background === 'primary' ? styles.primary : styles.secondary
            } ${color === 'white' ? styles.white : styles.black}`}
          >
            {children}
          </a>
        </Link>
      )}

      {as === 'button' && (
        <button
          onClick={handleClick}
          className={`${
            background === 'primary' ? styles.primary : styles.secondary
          } ${color === 'white' ? styles.white : styles.black}`}
        >
          {children}
        </button>
      )}
    </div>
  )
}

export default Button
