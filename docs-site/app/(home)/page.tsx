import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 14px',
        marginBottom: '24px',
        borderRadius: '9999px',
        border: '1px solid var(--color-fd-border)',
        backgroundColor: 'var(--color-fd-card)',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--color-fd-primary)'
      }}>
        v1.0.0 Live on NPM
      </div>

      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 56px)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        margin: '0 0 16px 0',
        maxWidth: '800px',
        lineHeight: 1.15
      }}>
        ABA PayWay TypeScript SDK
      </h1>

      <p style={{
        fontSize: 'clamp(16px, 2vw, 20px)',
        color: 'var(--color-fd-muted-foreground)',
        maxWidth: '650px',
        margin: '0 0 32px 0',
        lineHeight: 1.5
      }}>
        Unofficial, edge-ready SDK to accept payments, generate KHQR codes, check transaction status, and verify webhooks for ABA Bank Cambodia.
      </p>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '48px'
      }}>
        <Link
          href="/docs"
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-fd-primary)',
            color: 'var(--color-fd-primary-foreground)',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          Read Documentation
        </Link>
        <a
          href="https://github.com/rithsila/aba-payway-sdk-unofficial"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-fd-card)',
            color: 'var(--color-fd-foreground)',
            border: '1px solid var(--color-fd-border)',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          GitHub
        </a>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-fd-card)',
        border: '1px solid var(--color-fd-border)',
        borderRadius: '12px',
        padding: '16px 20px',
        textAlign: 'left'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--color-fd-muted-foreground)', marginBottom: '8px' }}>
          Quick Install
        </div>
        <code style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          color: 'var(--color-fd-primary)',
          userSelect: 'all'
        }}>
          npm install aba-payway-sdk-unofficial
        </code>
      </div>
    </div>
  );
}
