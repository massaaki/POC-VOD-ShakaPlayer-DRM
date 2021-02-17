import Link from 'next/link'
import { useRouter } from 'next/router'

const footer = () => {
  const router = useRouter()

  return (
    <footer>
      <ul>
        {router.locales.map((locale) => (
          <li key={locale}>
            <Link href={router.asPath} locale={locale}>
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  )
}

export default footer
