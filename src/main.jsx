import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowRight,
  ShoppingBag,
  Menu,
  Search,
  X,
  Plus,
  Minus,
  Trash2
} from "lucide-react";
import "./styles.css";

const image = (name) =>
  `${import.meta.env.BASE_URL}images/${name}`;

const products = [
  {
    id: 1,
    name: "Printed Full Sleeve",
    price: 1899,
    image: image("IMG_0905.jpeg"),
    category: "LONG SLEEVES"
  },
  {
    id: 2,
    name: "Branded Relaxed Fit",
    price: 1699,
    image: image("IMG_0906.jpeg"),
    category: "TEES"
  },
  {
    id: 3,
    name: "Baggy Track — 2 Line",
    price: 1999,
    image: image("IMG_0907.jpeg"),
    category: "PANTS"
  },
  {
    id: 4,
    name: "Heavy Printed Long Sleeve",
    price: 1899,
    image: image("IMG_0908.jpeg"),
    category: "LONG SLEEVES",
    tag: "NEW DROP"
  },
  {
    id: 5,
    name: "Real Tree Camo Cargo",
    price: 2499,
    image: image("IMG_0909.jpeg"),
    category: "PANTS",
    tag: "NEW DROP"
  },
  {
    id: 6,
    name: "Oversized Graphic Tee",
    price: 1599,
    image: image("IMG_0910.jpeg"),
    category: "TEES"
  },
  {
    id: 7,
    name: "Underground Jersey",
    price: 1999,
    image: image("IMG_0911.jpeg"),
    category: "JERSEYS"
  },
  {
    id: 8,
    name: "Vintage Washed Tee",
    price: 1799,
    image: image("IMG_0912.jpeg"),
    category: "TEES"
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

const money = (value) =>
  `₹${value.toLocaleString("en-IN")}`;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.body.style.overflow =
      menuOpen || cartOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(query);

      if (!matchesSearch) return false;

      if (activeCategory === "ALL") return true;

      if (activeCategory === "NEW DROP") {
        return product.tag === "NEW DROP";
      }

      return product.category === activeCategory;
    });
  }, [activeCategory, search]);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1
        }
      ];
    });

    setCartOpen(true);
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const scrollToProducts = () => {
    setActiveCategory("ALL");

    setTimeout(() => {
      document
        .getElementById("shop")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const scrollToNewDrop = () => {
    setActiveCategory("NEW DROP");

    setTimeout(() => {
      document
        .getElementById("shop")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site">
      <div className="top-strip">
        <p>FREE SHIPPING ON ORDERS ABOVE ₹1999</p>
        <p className="top-strip-right">
          WEIRD GANG WORLDWIDE
        </p>
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

          <button onClick={scrollToNewDrop}>
            NEW DROP
          </button>

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
            className={`cart-btn ${
              cartCount > 0 ? "has-items" : ""
            }`}
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            <span>{cartCount}</span>
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-panel">
          <Search size={19} />

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
              onClick={closeMenu}
            >
              <X size={23} />
            </button>
          </div>

          <nav>
            <a href="#shop" onClick={closeMenu}>
              SHOP
            </a>

            <button
              onClick={() => {
                closeMenu();
                scrollToNewDrop();
              }}
            >
              NEW DROP
            </button>

            <a href="#collections" onClick={closeMenu}>
              COLLECTIONS
            </a>

            <a href="#weird-gang" onClick={closeMenu}>
              WEIRD GANG
            </a>
          </nav>

          <div className="mobile-menu-bottom">
            <span>EST. 2026</span>
            <span>WEIRD CULTURE</span>
          </div>
        </div>
      )}

      {cartOpen && (
        <div
          className="cart-backdrop"
          onClick={() => setCartOpen(false)}
        />
      )}

      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <div>
            <span className="cart-kicker">
              YOUR BAG
            </span>

            <h2>
              CART
              <span>{cartCount}</span>
            </h2>
          </div>

          <button
            className="drawer-close"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={21} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={36} strokeWidth={1.2} />

            <h3>YOUR BAG IS EMPTY.</h3>

            <p>
              NOTHING WEIRD IN HERE YET.
            </p>

            <button
              className="cart-shop-btn"
              onClick={() => {
                setCartOpen(false);
                scrollToProducts();
              }}
            >
              SHOP THE CULTURE
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <div>
                        <h3>{item.name}</h3>

                        {item.tag && (
                          <span>{item.tag}</span>
                        )}
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            increaseQuantity(item.id)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <strong>
                        {money(
                          item.price * item.quantity
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>SUBTOTAL</span>
                <strong>{money(cartTotal)}</strong>
              </div>

              <p className="cart-note">
                SHIPPING CALCULATED AT CHECKOUT
              </p>

              <button
                className="checkout-btn"
                onClick={() =>
                  alert(
                    "Checkout is ready to connect with your payment/order system."
                  )
                }
              >
                CHECKOUT
                <ArrowRight size={17} />
              </button>

              <button
                className="continue-btn"
                onClick={() => setCartOpen(false)}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </>
        )}
      </aside>

      <main>
        <section className="hero">
          <div className="hero-image-wrap">
            <img
              src={image("IMG_0915.jpeg")}
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

              <button
                className="primary-btn"
                onClick={scrollToProducts}
              >
                <span>SHOP THE CULTURE</span>
                <ArrowRight size={17} />
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
              <span className="section-label">
                01 / SHOP
              </span>

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
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}

                {category === "NEW DROP" && (
                  <span className="category-dot" />
                )}
              </button>
            ))}
          </div>

          <div className="shop-status">
            <span>
              {activeCategory === "NEW DROP"
                ? "LATEST DROP"
                : "ALL PIECES"}
            </span>

            <span>
              {filteredProducts.length} PRODUCTS
            </span>
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
                    onClick={() => addToCart(product)}
                  >
                    <span>ADD TO BAG</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>

                    <span>
                      {product.tag || "WEIRD CULTURE"}
                    </span>
                  </div>

                  <strong>
                    {money(product.price)}
                  </strong>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <h3>NOTHING FOUND.</h3>
              <p>TRY ANOTHER SEARCH.</p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("ALL");
                }}
              >
                RESET SHOP
              </button>
            </div>
          )}
        </section>

        <section className="statement" id="new-drop">
          <div className="statement-no">
            02 / NEW DROP
          </div>

          <div className="statement-content">
            <p className="statement-small">
              JUST LANDED / 2026
            </p>

            <h2>
              STAY
              <br />
              <span>WEIRD.</span>
            </h2>

            <p className="statement-copy">
              THE LATEST PIECES FROM WEIRD CULTURE.
              <br />
              HEAVY GRAPHICS. OVERSIZED FITS.
              <br />
              RAW ENERGY. NOTHING NORMAL.
            </p>

            <div className="new-drop-pills">
              <span>01 / HEAVY PRINTED LS</span>
              <span>02 / REAL TREE CARGO</span>
            </div>

            <button
              className="outline-btn"
              onClick={scrollToNewDrop}
            >
              <span>SHOP NEW DROP</span>
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="statement-image">
            <img
              src={image("IMG_0913.jpeg")}
              alt="WEIRD CULTURE New Drop"
            />

            <div className="new-drop-stamp">
              NEW
              <strong>DROP</strong>
              2026
            </div>
          </div>
        </section>

        <section
          className="collection-section"
          id="collections"
        >
          <div className="collection-header">
            <span className="section-label">
              03 / COLLECTIONS
            </span>

            <h2>BUILT DIFFERENT.</h2>
          </div>

          <div className="collection-grid">
            <div className="collection-card collection-wide">
              <img
                src={image("IMG_0914.jpeg")}
                alt="Tees collection"
              />

              <div className="collection-overlay">
                <span>01</span>
                <h3>GRAPHIC TEES</h3>

                <button onClick={scrollToProducts}>
                  EXPLORE
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="collection-card">
              <img
                src={image("IMG_0915.jpeg")}
                alt="Pants collection"
              />

              <div className="collection-overlay">
                <span>02</span>
                <h3>BAGGY PANTS</h3>

                <button
                  onClick={() => {
                    setActiveCategory("PANTS");
                    document
                      .getElementById("shop")
                      ?.scrollIntoView({
                        behavior: "smooth"
                      });
                  }}
                >
                  EXPLORE
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="collection-card">
              <img
                src={image("IMG_0916.jpeg")}
                alt="Jersey collection"
              />

              <div className="collection-overlay">
                <span>03</span>
                <h3>JERSEYS</h3>

                <button
                  onClick={() => {
                    setActiveCategory("JERSEYS");
                    document
                      .getElementById("shop")
                      ?.scrollIntoView({
                        behavior: "smooth"
                      });
                  }}
                >
                  EXPLORE
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="gang-section"
          id="weird-gang"
        >
          <div className="gang-content">
            <span className="section-label">
              04 / WEIRD GANG
            </span>

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
              <span>@WEIRDCULTURE</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="gang-image">
            <img
              src={image("IMG_0911.jpeg")}
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
            <span className="section-label">
              05 / STAY WEIRD
            </span>

            <h2>
              DON'T MISS
              <br />
              THE NEXT DROP.
            </h2>
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
              JOIN
              <ArrowRight size={17} />
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

              <button onClick={scrollToNewDrop}>
                NEW DROP
              </button>

              <a href="#collections">
                COLLECTIONS
              </a>
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
              <a href="#weird-gang">
                WEIRD GANG
              </a>
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