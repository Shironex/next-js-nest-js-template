import { Fragment, ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return <Fragment>{children}</Fragment>
}

export default MainLayout
