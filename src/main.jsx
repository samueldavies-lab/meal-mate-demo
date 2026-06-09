import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding: 40, fontFamily: 'system-ui, sans-serif', background: '#fff', minHeight: '100vh'}}>
          <h2 style={{color: '#dc2626', marginBottom: 16}}>Something went wrong</h2>
          <pre style={{background: '#f5f5f5', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13, lineHeight: 1.5, maxWidth: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)
