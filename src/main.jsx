import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowRight,
  Bag,
  ChevronDown,
  Menu,
  Search,
  X
} from "lucide-react";
import "./styles.css";
const products = [
  {
    id: 1,
    name: "Printed Full Sleeve",
    price: "₹1,899",
    image: "/images/IMG_0905.jpeg",
    tag: "NEW DROP"
  },
  {
    id: 2,
    name: "Branded Relaxed Fit",
    price: "₹1,699",
    image: "/images/IMG_0906.jpeg"
  },
  {
    id: 3,
    name: "Baggy Track — 2 Line",
    price: "₹1,999",
    image: "/images/IMG_0907.jpeg"
  },
  {
    id: 4,
    name: "Heavy Printed Long Sleeve",
    price: "₹1,899",
    image: "/images/IMG_0908.jpeg",
    tag: "NEW"
  },
  {
    id: 5,
    name: "Real Tree Camo Cargo",
    price: "₹2,499",
    image: "/images/IMG_0909.jpeg",
    tag: "NEW DROP"
  },
  {
    id: 6,
    name: "Oversized Graphic Tee",
    price: "₹1,599",
    image: "/images/IMG_0910.jpeg"
  },
  {
    id: 7,
    name: "Underground Jersey",
    price: "₹1,999",
    image: "/images/IMG_0911.jpeg"
  },
  {
    id: 8,
    name: "Vintage Washed Tee",
    price: "₹1,799",
    image: "/images/IMG_0912.jpeg"
  }
];
const categories = [
  "ALL",
  "TEES",
  "LONG SLEEVES",
  "JERSEYS",
  "PANTS",
  "NEW DROP"
];
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    if (activeCategory === "ALL") return matchesSearch;
    if (activeCategory === "NEW DROP") {
      return product.tag && matchesSearch;
    }
    const category = activeCategory.toLowerCase();
    if (category === "tees") {
      return (
        product.name.toLowerCase().includes("tee") &&
        matchesSearch
      );
    }
    if (category === "long sleeves") {
      return (
        product.name.toLowerCase().includes("sleeve") &&
        matchesSearch
      );
    }
    if (category === "jerseys") {
      return (
        product.name.toLowerCase().includes("jersey") &&
        matchesSearch
      );
    }
    if (category === "pants") {
      return (
        product.name.toLowerCase().includes("pant") ||
        product.name.toLowerCase().includes("cargo") ||
        product.name.toLowerCase().includes("track")
      ) && matchesSearch;
    }
    return matchesSearch;
  });
  const addToCart = () => {
    setCartCount((count) => count + 1);
  };
  const scrollToProducts = () => {
    document
      .getElementById("shop")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="site">
      <div className="top-strip">
        <p>FREE SHIPPING ON ORDERS ABOVE ₹1999</p>
        <p className="top-strip-right">WEIRD GANG WORLDWIDE</p>
      </div>
      <header className="header">
        <button
          className="icon-btn mobile-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>
        <a href="#" className="logo">
          WEIRD
          <span>CULTURE</span>
        </a>
        <nav className="desktop-nav">
          <a href="#shop">SHOP</a>
          <a href="#new-drop">NEW DROP</a>
          <a href="#collections">COLLECTIONS</a>
          <a href="#weird-gang">WEIRD GANG</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-btn search-btn"
            onClick={() => setSearchOpen((value) => !value)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button
            className="cart-btn"
            onClick={scrollToProducts}
            aria-label="Cart"
          >
            <Bag size={19} />
            <span>{cartCount}</span>
          </button>
        </div>
      </header>
      {searchOpen && (
        <div className="search-panel">
          <Search size={20} />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH THE CULTURE..."
          />
          <button
            className="close-search"
            onClick={() => {
              setSearchOpen(false);
              setSearch("");
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-top">
            <span>MENU</span>
            <button
              className="icon-btn"
              onClick={() => setMenuOpen(false)}
            >
              <X size={23} />
            </button>
          </div>
          <nav>
            <a href="#shop" onClick={() => setMenuOpen(false)}>SHOP</a>
            <a href="#new-drop" onClick={() => setMenuOpen(false)}>NEW DROP</a>
            <a href="#collections" onClick={() => setMenuOpen(false)}>COLLECTIONS</a>
            <a href="#weird-gang" onClick={() => setMenuOpen(false)}>WEIRD GANG</a>
          </nav>
          <div className="mobile-menu-bottom">
            <span>EST. 2026</span>
            <span>WEIRD CULTURE</span>
          </div>
        </div>
      )}
      <main>
        <section className="hero">
          <div className="hero-image-wrap">
            <img
              src="/images/IMG_0905.jpeg"
              alt="WEIRD CULTURE streetwear"
              className="hero-image"
            />
            <div className="hero-overlay" />
          </div>
          <div className="hero-content">
            <div className="hero-kicker">
              <span className="red-dot" />
              UNDERGROUND / INDIA / 2026
            </div>
            <h1>
              WEIRD
              <br />
              <em>CULTURE</em>
            </h1>
            <div className="hero-bottom">
              <p>
                NOT MADE FOR EVERYONE.
                <br />
                MADE FOR THE WEIRD.
              </p>
              <button className="primary-btn" onClick={scrollToProducts}>
                SHOP THE DROP
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="hero-scroll">
            <ArrowDown size={15} />
            SCROLL TO EXPLORE
          </div>
        </section>
        <section className="marquee">
          <div className="marquee-track">
            <span>WEIRD CULTURE</span>
            <i>✦</i>
            <span>WEIRD GANG</span>
            <i>✦</i>
            <span>NO NORMAL PEOPLE</span>
            <i>✦</i>
            <span>WEIRD CULTURE</span>
            <i>✦</i>
            <span>WEIRD GANG</span>
            <i>✦</i>
          </div>
        </section>
        <section className="shop-section" id="shop">
          <div className="section-head">
            <div>
              <span className="section-label">01 / SHOP</span>
              <h2>THE CULTURE</h2>
            </div>
            <p>
              GRAPHICS. ATTITUDE.
              <br />
              NOTHING ORDINARY.
            </p>
          </div>
          <div className="category-bar">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category ? "active" : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <article
                className={`product-card ${
                  index === 0 || index === 5
                    ? "product-card-large"
                    : ""
                }`}
                key={product.id}
              >
                <div className="product-image-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                  {product.tag && (
                    <span className="product-tag">
                      {product.tag}
                    </span>
                  )}
                  <button
                    className="quick-add"
                    onClick={addToCart}
                  >
                    ADD TO BAG
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <span>WEIRD CULTURE</span>
                  </div>
                  <strong>{product.price}</strong>
                </div>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <h3>NOTHING FOUND.</h3>
              <p>TRY ANOTHER SEARCH.</p>
            </div>
          )}
        </section>
        <section className="statement" id="new-drop">
          <div className="statement-no">02 / NEW DROP</div>
          <div className="statement-content">
            <p className="statement-small">THIS IS NOT A TREND.</p>
            <h2>
              STAY
              <br />
              <span>WEIRD.</span>
            </h2>
            <p className="statement-copy">
              BUILT FOR THE ONES WHO DON'T FIT THE
              <br />
              MOULD. BOLD GRAPHICS. OVERSIZED FITS.
              <br />
              RAW ENERGY.
            </p>
            <button className="outline-btn" onClick={scrollToProducts}>
              EXPLORE NEW DROP
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="statement-image">
            <img
              src="/images/IMG_0913.jpeg"
              alt="New Weird Culture collection"
            />
          </div>
        </section>
        <section className="collection-section" id="collections">
          <div className="collection-header">
            <span className="section-label">03 / COLLECTIONS</span>
            <h2>BUILT DIFFERENT.</h2>
          </div>
          <div className="collection-grid">
            <div className="collection-card collection-wide">
              <img
                src="/images/IMG_0914.jpeg"
                alt="Tees collection"
              />
              <div className="collection-overlay">
                <span>01</span>
                <h3>GRAPHIC TEES</h3>
                <button onClick={scrollToProducts}>
                  EXPLORE <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <div className="collection-card">
              <img
                src="/images/IMG_0915.jpeg"
                alt="Pants collection"
              />
              <div className="collection-overlay">
                <span>02</span>
                <h3>BAGGY PANTS</h3>
                <button onClick={scrollToProducts}>
                  EXPLORE <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <div className="collection-card">
              <img
                src="/images/IMG_0916.jpeg"
                alt="Jersey collection"
              />
              <div className="collection-overlay">
                <span>03</span>
                <h3>JERSEYS</h3>
                <button onClick={scrollToProducts}>
                  EXPLORE <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="gang-section" id="weird-gang">
          <div className="gang-content">
            <span className="section-label">04 / WEIRD GANG</span>
            <h2>
              JOIN THE
              <br />
              <span>WEIRD GANG.</span>
            </h2>
            <p>
              WEAR WHAT YOU WANT.
              <br />
              BE WHO YOU ARE.
              <br />
              NEVER FIT IN.
            </p>
            <button className="primary-btn">
              @WEIRDCULTURE
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="gang-image">
            <img
              src="/images/IMG_0911.jpeg"
              alt="WEIRD GANG"
            />
            <div className="gang-stamp">
              <span>WEIRD</span>
              <strong>GANG</strong>
              <span>EST. 2026</span>
            </div>
          </div>
        </section>
        <section className="newsletter">
          <div>
            <span className="section-label">05 / STAY WEIRD</span>
            <h2>DON'T MISS<br />THE NEXT DROP.</h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("You're in the WEIRD GANG.");
            }}
          >
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              required
            />
            <button type="submit">
              JOIN <ArrowRight size={17} />
            </button>
          </form>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo footer-logo">
              WEIRD
              <span>CULTURE</span>
            </div>
            <p>
              FOR THE WEIRD.
              <br />
              AGAINST THE NORMAL.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <span>SHOP</span>
              <a href="#shop">ALL PRODUCTS</a>
              <a href="#new-drop">NEW DROP</a>
              <a href="#collections">COLLECTIONS</a>
            </div>
            <div>
              <span>INFO</span>
              <a href="#">ABOUT US</a>
              <a href="#">SHIPPING</a>
              <a href="#">CONTACT</a>
            </div>
            <div>
              <span>SOCIAL</span>
              <a href="#">INSTAGRAM</a>
              <a href="#">WEIRD GANG</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 WEIRD CULTURE</span>
          <span>MADE FOR THE WEIRD.</span>
          <span>INDIA</span>
        </div>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);