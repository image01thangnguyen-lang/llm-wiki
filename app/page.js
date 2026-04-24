import { getWikiPages } from '@/lib/wiki-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function summarize(pages) {
  const byCategory = pages.reduce((acc, page) => {
    acc[page.category] = (acc[page.category] || 0) + 1;
    return acc;
  }, {});

  const totalLinks = pages.reduce((sum, p) => sum + (p.links?.length || 0), 0);

  return {
    total: pages.length,
    entities: byCategory.entity || 0,
    concepts: byCategory.concept || 0,
    sources: byCategory.source || 0,
    syntheses: byCategory.synthesis || 0,
    totalLinks
  };
}

export default async function HomePage() {
  const { pages, source } = await getWikiPages();
  const stats = summarize(pages);

  return (
    <main className="wrapper">
      <h1 className="title">LLM Wiki Viewer</h1>
      <p className="subtitle">
        Database mode: <span className="badge">{source}</span>
      </p>

      {source !== 'firebase' && (
        <p className="note">
          Chưa kết nối Firebase hoặc collection rỗng. App đang fallback đọc từ thư mục <code>wiki/</code>.
        </p>
      )}

      <section className="grid">
        <article className="card"><h2>Total Pages</h2><p>{stats.total}</p></article>
        <article className="card"><h2>Entities</h2><p>{stats.entities}</p></article>
        <article className="card"><h2>Concepts</h2><p>{stats.concepts}</p></article>
        <article className="card"><h2>Sources</h2><p>{stats.sources}</p></article>
        <article className="card"><h2>Syntheses</h2><p>{stats.syntheses}</p></article>
        <article className="card"><h2>Total Links</h2><p>{stats.totalLinks}</p></article>
      </section>

      <section className="list">
        {pages.map((page) => (
          <article className="card" key={page.id}>
            <h3 className="item-title">{page.title}</h3>
            <div className="meta">
              <span className="badge">{page.id}</span>
              <span>{page.category}</span>
              <span>{page.links?.length || 0} links</span>
              <span>{page.sourcePath || 'firebase'}</span>
            </div>
            {page.links?.length > 0 && (
              <ul className="links">
                {page.links.slice(0, 8).map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
