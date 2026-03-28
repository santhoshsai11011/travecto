export default function NewsCard({ data }) {
  if (!data) return null

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <span style={{ fontSize: '18px' }}>📰</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          News from {data.city}
        </span>
      </div>

      <div>
        {data.articles?.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 20px',
              borderBottom: i < data.articles.length - 1 ? '1px solid #e5e9f0' : 'none',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt=""
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                onError={e => e.target.style.display = 'none'}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '14px', fontWeight: 700, color: '#0f1f4b',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                marginBottom: '4px', lineHeight: 1.45,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {article.title}
              </p>
              <p style={{
                fontSize: '12px', color: '#6b7280',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                marginBottom: '6px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {article.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{article.source}</span>
                <span style={{ color: '#e5e9f0' }}>·</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
