import Footer from 'ui/layout/Footer'

interface IDefaultLayoutProps {
  children: JSX.Element
}

const DefaultLayout = ({ children }: IDefaultLayoutProps) => {
  return (
    <>
      <div className="defaultLayout">
        {children}
        <Footer />
      </div>
    </>
  )
}

export default DefaultLayout
