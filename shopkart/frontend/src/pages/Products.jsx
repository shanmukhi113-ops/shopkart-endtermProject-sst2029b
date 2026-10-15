import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getProducts } from "../services/api";

const categories = ["Electronics", "Fashion", "Books", "Home"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getProducts({ search, category });
        setProducts(response.data.products);
      } catch {
        setError("Something went wrong while loading products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">PRODUCT DISCOVERY</p>
            <h1>Find your next favorite</h1>
            <p className="muted">Search products or choose a category.</p>
          </div>
        </div>

        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
        />

        {loading && <div className="state-card">Loading products...</div>}
        {!loading && error && <div className="state-card error-box">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <div className="state-card">No products found.</div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}