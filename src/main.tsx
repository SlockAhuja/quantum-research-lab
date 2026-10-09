import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[QRL Error Boundary Caught Exception]:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#07090e',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '32rem',
            width: '100%',
            backgroundColor: '#0d121f',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8', marginBottom: '0.5rem' }}>
              Quantum Research Lab
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
              An unexpected runtime error occurred during workstation execution.
            </p>
            {this.state.error && (
              <pre style={{
                fontSize: '0.75rem',
                backgroundColor: '#020617',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                overflowX: 'auto',
                color: '#f87171',
                textAlign: 'left',
                marginBottom: '1rem'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#06b6d4',
                color: '#020617',
                fontWeight: '600',
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
