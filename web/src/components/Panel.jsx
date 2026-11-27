import Sidebar from './Sidebar'

function Panel({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}

export default Panel
