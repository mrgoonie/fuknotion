import { MainLayout, ErrorBoundary } from './components'

function App() {
  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  )
}

export default App
