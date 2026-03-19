import React from 'react'
import ReactDOM from 'react-dom/client'

// Component Explorer — placeholder for Phase 9
function ComponentExplorer() {
    return (
        <div>
            <h1>Component Explorer</h1>
            <p>Coming in Phase 9.</p>
        </div>
    )
}

const rootElement = document.getElementById('root')
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ComponentExplorer />
        </React.StrictMode>
    )
}
