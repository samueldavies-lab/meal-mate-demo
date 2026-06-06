import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('React error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding: 40, fontFamily: 'sans-serif'}}>
          <h2 style={{color: 'red'}}>Something went wrong</h2>
          <pre style={{background: '#f5f5f5', padding: 16, borderRadius: 8, overflow: 'auto'}}>
            {this.state.error.message}<br/>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

window.onerror = (msg, url, line, col, error) => {
  document.getElementById('root').innerHTML = `
    <div style="padding:40px;font-family:sans-serif">
      <h2 style="color:red">JavaScript Error</h2>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px">${msg}\n${error?.stack || ''}</pre>
    </div>
  `;
};

window.addEventListener('unhandledrejection', (e) => {
  document.getElementById('root').innerHTML = `
    <div style="padding:40px;font-family:sans-serif">
      <h2 style="color:red">Unhandled Promise Error</h2>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px">${e.reason?.message || e.reason}</pre>
    </div>
  `;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)
