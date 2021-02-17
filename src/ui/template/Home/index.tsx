import useTranslation from 'next-translate/useTranslation'

const Home = () => {
  const { t } = useTranslation()
  return (
    <>
      <h1>Home</h1>
      <p>{t('common:title')}</p>
    </>
  )
}

export default Home
