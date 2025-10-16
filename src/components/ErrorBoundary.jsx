import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            margin: '20px',
            border: '1px solid #e74c3c',
            borderRadius: '8px',
            backgroundColor: '#fdf2f2',
          }}
        >
          <h2 style={{ color: '#e74c3c' }}>🚨 Something went wrong</h2>
          <p>
            The application encountered an error. Please try refreshing the
            page.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Refresh Page
          </button>

          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', color: '#7f8c8d' }}>
              Technical Details (click to expand)
            </summary>
            <pre
              style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '10px',
              }}
            >
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
