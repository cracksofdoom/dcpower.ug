import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { CATEGORIES } from '../data/products';
import { useSeo } from '../hooks/useSeo';
import { search, brandsOf } from '../lib/helpers';
// CSS is processed by the bundler; TypeScript has no declaration for this side-effect import.
import '../styles/products.css';

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = sp.get('q') ?? '';
  const cat = sp.get('cat') ?? '';
  const brand = sp.get('brand') ?? '';
  const sort = sp.get('sort') ?? 'featured';

  useSeo({
    title: cat || 'All solar products',
    description: `Browse ${
      cat || 'solar panels, batteries, solar lights, inverters and complete solar systems'
    } available in Uganda.`,
    path: '/products',
  });

  const upd = (key: string, value: string) => {
    const next = new URLSearchParams(sp);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSp(next, {
      replace: true,
    });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();

    if (q) {
      next.set('q', q);
    }

    setSp(next, {
      replace: true,
    });
  };

  const activeFilterCount = [cat, brand].filter(Boolean).length;

  const hasFilters = activeFilterCount > 0;

  const list = useMemo(() => {
    let filtered = search(q).filter((p) => {
      const matchesCategory = !cat || p.category === cat;

      const matchesBrand = !brand || p.brand === brand;

      return matchesCategory && matchesBrand;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);

        case 'newest':
          return Number(!!b.featured) - Number(!!a.featured);

        case 'featured':
        default:
          return Number(!!b.featured) - Number(!!a.featured);
      }
    });
  }, [q, cat, brand, sort]);

  return (
    <div className="products-page">
      <div className="wrap pad">
        {/* Page heading */}
        <header className="products-heading">
          <div>
            <h1>{q ? `Results for "${q}"` : cat || 'Solar products'}</h1>

            <p className="products-intro">
              Find solar panels, batteries, lights, inverters and other power solutions for your
              home or business.
            </p>
          </div>
        </header>

        {/* Search + filter controls */}
        <section className="products-toolbar">
          <div className="products-search">
            <label htmlFor="product-search">
              <span className="sr">Search products</span>

              <input
                id="product-search"
                type="search"
                value={q}
                placeholder="Search products, brands or categories..."
                onChange={(e) => upd('q', e.target.value)}
              />
            </label>
          </div>

          <div className="products-toolbar-actions">
            <button
              type="button"
              className={`filter-toggle ${filtersOpen ? 'is-open' : ''}`}
              aria-expanded={filtersOpen}
              aria-controls="product-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <FilterIcon />

              <span>Filters</span>

              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>

            <label className="sort-control">
              <span>Sort</span>

              <select
                value={sort}
                onChange={(e) => upd('sort', e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>

                <option value="name">Name: A–Z</option>
              </select>
            </label>
          </div>
        </section>

        {/* Active filters */}
        {(hasFilters || brand || cat) && (
          <div className="active-filters">
            <span className="active-filters-label">Active:</span>

            {cat && (
              <button type="button" className="filter-chip" onClick={() => upd('cat', '')}>
                {cat}
                <CloseIcon />
              </button>
            )}

            {brand && (
              <button type="button" className="filter-chip" onClick={() => upd('brand', '')}>
                {brand}
                <CloseIcon />
              </button>
            )}

            {hasFilters && (
              <button type="button" className="clear-filters" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
        )}

        <div className="shop">
          {/* Collapsible filters */}
          <div
            id="product-filters"
            className={`filters-panel ${filtersOpen ? 'is-open' : ''}`}
            hidden={!filtersOpen}
          >
            <form
              className="filters"
              aria-label="Product filters"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="filters-header">
                <div>
                  <h2>Filter products</h2>
                </div>

                <button
                  type="button"
                  className="filters-close"
                  aria-label="Close filters"
                  onClick={() => setFiltersOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>

              <label>
                Category
                <select value={cat} onChange={(e) => upd('cat', e.target.value)}>
                  <option value="">All categories</option>

                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Brand
                <select value={brand} onChange={(e) => upd('brand', e.target.value)}>
                  <option value="">All brands</option>

                  {brandsOf().map((brandName) => (
                    <option key={brandName} value={brandName}>
                      {brandName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="filters-actions">
                <button type="button" className="btn btn-ghost-dark" onClick={clearFilters}>
                  Clear filters
                </button>

                <button type="button" className="btn" onClick={() => setFiltersOpen(false)}>
                  Show {list.length} products
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <section className="products-results" aria-label="Product results">
            <div className="results-header">
              <p className="results-count" role="status" aria-live="polite">
                <strong>{list.length}</strong> {list.length === 1 ? 'product' : 'products'}
                {q || hasFilters ? ' found' : ''}
              </p>

              {brand && (
                <p className="muted">
                  Brand: <strong>{brand}</strong>
                </p>
              )}
            </div>

            {list.length > 0 ? (
              <div className="grid">
                {list.map((product, index) => (
                  <Reveal key={product.id} delay={(index % 4) * 60}>
                    <ProductCard p={product} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔎</div>

                <h2>No products found</h2>

                <p>
                  We couldn't find products matching your current search and filters. Try a
                  different search term or remove some filters.
                </p>

                <div className="empty-state-actions">
                  <button type="button" className="btn" onClick={clearFilters}>
                    Clear filters
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost-dark"
                    onClick={() => {
                      upd('q', '');
                      setFiltersOpen(false);
                    }}
                  >
                    Browse all products
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
