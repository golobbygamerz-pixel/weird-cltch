import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
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
  Trash2,
  User,
  LogOut,
  Package,
  ChevronRight
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

/* =========================
   SUPABASE CONFIG
========================= */

const cleanEnvValue = (value = "") =>
  String(value)
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "");

const SUPABASE_URL = cleanEnvValue(
  import.meta.env.VITE_SUPABASE_URL
)
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");

const SUPABASE_ANON_KEY = cleanEnvValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  } catch (error) {
    console.error(
      "Supabase initialization failed:",
      error
    );
    supabase = null;
  }
}

const image = (name) =>
  `${import.meta.env.BASE_URL}images/${name}`;

const sizes = ["S", "M", "L", "XL", "XXL"];

/* =========================
   PRODUCTS
========================= */

const products = [
  {
    id: 1,
    name: "Printed Full Sleeve",
    price: 1899,
    image: image("IMG_0905.jpeg"),
    category: "LONG SLEEVES",
    hasOptions: true,
    variants: [
      {
        name: "DESIGN 01",
        image: image("IMG_0905.jpeg")
      },
      {
        name: "DESIGN 02",
        image: image("IMG_0906.jpeg")
      },
      {
        name: "DESIGN 03",
        image: image("IMG_0907.jpeg")
      },
      {
        name: "DESIGN 04",
        image: image("IMG_0908.jpeg")
      }
    ]
  },
  {
    id: 2,
    name: "Branded Relaxed Fit",
    price: 1699,
    image: image("IMG_0909.jpeg"),
    category: "TEES",
    hasOptions: true,
    variants: [
      {
        name: "DESIGN 01",
        image: image("IMG_0909.jpeg")
      },
      {
        name: "DESIGN 02",
        image: image("IMG_0910.jpeg")
      },
      {
        name: "DESIGN 03",
        image: image("IMG_0911.jpeg")
      }
    ]
  },
  {
    id: 3,
    name: "Baggy Track — 2 Line",
    price: 1999,
    image: image("IMG_0913.jpeg"),
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
    image: image("IMG_0915.jpeg"),
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
  `₹${Number(value).toLocaleString("en-IN")}`;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] =
    useState("ALL");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [productModal, setProductModal] =
    useState(null);

  const [selectedVariant, setSelectedVariant] =
    useState(0);

  const [selectedSize, setSelectedSize] =
    useState("");

  const [selectedQuantity, setSelectedQuantity] =
    useState(1);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] =
    useState("login");

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [ordersOpen, setOrdersOpen] =
    useState(false);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] =
    useState(true);

  const carouselRef = useRef(null);

  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    fullName: ""
  });

  const [checkoutForm, setCheckoutForm] =
    useState({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: ""
    });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] =
    useState(false);

  /* =========================
     AUTH SESSION
  ========================= */

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error(
            "Supabase session error:",
            error
          );
        }

        if (mounted) {
          setUser(
            data?.session?.user || null
          );
          setAuthLoading(false);
        }
      })
      .catch((error) => {
        console.error(
          "Supabase session failed:",
          error
        );

        if (mounted) {
          setAuthLoading(false);
        }
      });

    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(
            session?.user || null
          );
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  /* =========================
     BODY LOCK
  ========================= */

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ||
      cartOpen ||
      productModal ||
      authOpen ||
      accountOpen ||
      checkoutOpen ||
      ordersOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    menuOpen,
    cartOpen,
    productModal,
    authOpen,
    accountOpen,
    checkoutOpen,
    ordersOpen
  ]);

  /* =========================
     USER PROFILE
  ========================= */

  useEffect(() => {
    if (user) {
      setCheckoutForm((current) => ({
        ...current,
        email: user.email || ""
      }));

      loadProfile();
    }
  }, [user]);

  /* =========================
     CART
  ========================= */

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  const shipping =
    cartTotal >= 1999 ||
    cartTotal === 0
      ? 0
      : 99;

  const grandTotal =
    cartTotal + shipping;

  /* =========================
     PRODUCT FILTER
  ========================= */

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return products.filter(
      (product) => {
        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (activeCategory === "ALL") {
          return true;
        }

        if (
          activeCategory ===
          "NEW DROP"
        ) {
          return (
            product.tag ===
            "NEW DROP"
          );
        }

        return (
          product.category ===
          activeCategory
        );
      }
    );
  }, [activeCategory, search]);

  /* =========================
     PRODUCT MODAL
  ========================= */

  const openProductOptions = (
    product
  ) => {
    setProductModal(product);
    setSelectedVariant(0);
    setSelectedSize("");
    setSelectedQuantity(1);

    setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollTo({
          left: 0,
          behavior: "instant"
        });
      }
    }, 0);
  };

  const closeProductOptions = () => {
    setProductModal(null);
    setSelectedVariant(0);
    setSelectedSize("");
    setSelectedQuantity(1);
  };

  const handleCarouselScroll = (
    event
  ) => {
    const container =
      event.currentTarget;

    if (
      !productModal?.variants?.length
    ) {
      return;
    }

    const slides =
      container.querySelectorAll(
        ".product-carousel-slide"
      );

    if (!slides.length) {
      return;
    }

    const containerCenter =
      container.scrollLeft +
      container.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach(
      (slide, index) => {
        const slideCenter =
          slide.offsetLeft +
          slide.offsetWidth / 2;

        const distance =
          Math.abs(
            containerCenter -
              slideCenter
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;
          closestIndex = index;
        }
      }
    );

    setSelectedVariant(
      closestIndex
    );
  };

  const selectCarouselVariant = (
    index
  ) => {
    setSelectedVariant(index);

    const container =
      carouselRef.current;

    if (!container) {
      return;
    }

    const slide =
      container.querySelectorAll(
        ".product-carousel-slide"
      )[index];

    slide?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  };

  /* =========================
     CART FUNCTIONS
  ========================= */

  const addToCart = (
    product,
    variant = null,
    size = null,
    quantity = 1
  ) => {
    const variantName =
      variant?.name || "";

    const cartKey = [
      product.id,
      variantName,
      size || ""
    ].join("-");

    setCart(
      (currentCart) => {
        const existing =
          currentCart.find(
            (item) =>
              item.cartKey ===
              cartKey
          );

        if (existing) {
          return currentCart.map(
            (item) =>
              item.cartKey ===
              cartKey
                ? {
                    ...item,
                    quantity:
                      item.quantity +
                      quantity
                  }
                : item
          );
        }

        return [
          ...currentCart,
          {
            ...product,
            cartKey,
            image:
              variant?.image ||
              product.image,
            variantName,
            size,
            quantity
          }
        ];
      }
    );

    setCartOpen(true);
  };

  const handleProductAdd = () => {
    if (!productModal) {
      return;
    }

    if (!selectedSize) {
      alert(
        "PLEASE SELECT A SIZE."
      );
      return;
    }

    const variant =
      productModal.variants?.[
        selectedVariant
      ] || null;

    addToCart(
      productModal,
      variant,
      selectedSize,
      selectedQuantity
    );

    closeProductOptions();
  };

  const increaseQuantity = (
    id
  ) => {
    setCart(
      (currentCart) =>
        currentCart.map(
          (item) =>
            item.cartKey === id
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    1
                }
              : item
        )
    );
  };

  const decreaseQuantity = (
    id
  ) => {
    setCart(
      (currentCart) =>
        currentCart
          .map((item) =>
            item.cartKey === id
              ? {
                  ...item,
                  quantity:
                    item.quantity -
                    1
                }
              : item
          )
          .filter(
            (item) =>
              item.quantity > 0
          )
    );
  };

  const removeFromCart = (
    id
  ) => {
    setCart(
      (currentCart) =>
        currentCart.filter(
          (item) =>
            item.cartKey !== id
        )
    );
  };

  /* =========================
     NAVIGATION
  ========================= */

  const scrollToProducts = () => {
    setActiveCategory("ALL");

    setTimeout(() => {
      document
        .getElementById("shop")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    }, 50);
  };

  const scrollToNewDrop = () => {
    setActiveCategory(
      "NEW DROP"
    );

    setTimeout(() => {
      document
        .getElementById("shop")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    }, 50);
  };

  const closeMenu = () =>
    setMenuOpen(false);

  /* =========================
     AUTH UI
  ========================= */

  const openAuth = (
    mode = "login"
  ) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setAccountOpen(false);
  };

  const closeAuth = () => {
    setAuthOpen(false);

    setAuthForm({
      email: "",
      password: "",
      fullName: ""
    });
  };

  const handleAuth = async (
    event
  ) => {
    event.preventDefault();

    if (!supabase) {
      alert(
        "SUPABASE CONFIGURATION IS MISSING OR INVALID. CHECK YOUR GITHUB ACTIONS SECRETS."
      );
      return;
    }

    try {
      if (
        authMode ===
        "signup"
      ) {
        const {
          data,
          error
        } =
          await supabase.auth.signUp(
            {
              email:
                authForm.email.trim(),
              password:
                authForm.password,
              options: {
                data: {
                  full_name:
                    authForm.fullName.trim()
                }
              }
            }
          );

        if (error) {
          throw error;
        }

        if (data?.user) {
          const {
            error:
              profileError
          } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              full_name:
                authForm.fullName.trim()
            });

          if (profileError) {
            console.error(
              "Profile creation error:",
              profileError
            );
          }
        }

        alert(
          "ACCOUNT CREATED. CHECK YOUR EMAIL IF CONFIRMATION IS REQUIRED."
        );

        closeAuth();
        return;
      }

      const {
        error
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              authForm.email.trim(),
            password:
              authForm.password
          }
        );

      if (error) {
        throw error;
      }

      closeAuth();
    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      alert(
        error?.message ||
          "AUTHENTICATION FAILED."
      );
    }
  };

  const logout = async () => {
    if (!supabase) {
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    setUser(null);
    setAccountOpen(false);
    setOrders([]);
  };

  /* =========================
     PROFILE
  ========================= */

  const loadProfile = async () => {
    if (!supabase || !user) {
      return;
    }

    try {
      const {
        data,
        error
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Profile load error:",
          error
        );
        return;
      }

      if (data) {
        setCheckoutForm(
          (current) => ({
            ...current,
            fullName:
              data.full_name ||
              current.fullName,
            phone:
              data.phone ||
              current.phone,
            address:
              data.address ||
              current.address,
            city:
              data.city ||
              current.city,
            state:
              data.state ||
              current.state,
            pincode:
              data.pincode ||
              current.pincode
          })
        );
      }
    } catch (error) {
      console.error(
        "Profile request failed:",
        error
      );
    }
  };

  /* =========================
     CHECKOUT
  ========================= */

  const openCheckout = () => {
    if (!cart.length) {
      alert(
        "YOUR BAG IS EMPTY."
      );
      return;
    }

    if (!user) {
      setCartOpen(false);
      openAuth("login");
      return;
    }

    setCartOpen(false);
    setCheckoutOpen(true);
    loadProfile();
  };

  const placeOrder = async (
    event
  ) => {
    event.preventDefault();

    if (!supabase || !user) {
      openAuth("login");
      return;
    }

    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode"
    ];

    const missing =
      requiredFields.some(
        (field) =>
          !String(
            checkoutForm[field] ||
              ""
          ).trim()
      );

    if (missing) {
      alert(
        "PLEASE COMPLETE ALL DELIVERY DETAILS."
      );
      return;
    }

    try {
      const {
        error: profileError
      } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name:
            checkoutForm.fullName.trim(),
          phone:
            checkoutForm.phone.trim(),
          address:
            checkoutForm.address.trim(),
          city:
            checkoutForm.city.trim(),
          state:
            checkoutForm.state.trim(),
          pincode:
            checkoutForm.pincode.trim()
        });

      if (profileError) {
        throw profileError;
      }

      const orderItems =
        cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          variant:
            item.variantName ||
            null,
          size:
            item.size || null,
          price: item.price,
          quantity:
            item.quantity,
          image: item.image
        }));

      const {
        error: orderError
      } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name:
            checkoutForm.fullName.trim(),
          phone:
            checkoutForm.phone.trim(),
          email:
            checkoutForm.email.trim() ||
            user.email,
          address:
            checkoutForm.address.trim(),
          city:
            checkoutForm.city.trim(),
          state:
            checkoutForm.state.trim(),
          pincode:
            checkoutForm.pincode.trim(),
          items: orderItems,
          subtotal: cartTotal,
          shipping,
          total: grandTotal,
          status: "PENDING",
          payment_status:
            "PENDING"
        });

      if (orderError) {
        throw orderError;
      }

      setCart([]);
      setCheckoutOpen(false);

      alert(
        "ORDER PLACED SUCCESSFULLY. PAYMENT STATUS: PENDING."
      );

      loadOrders();
    } catch (error) {
      console.error(
        "Order error:",
        error
      );

      alert(
        error?.message ||
          "COULD NOT PLACE ORDER."
      );
    }
  };

  /* =========================
     ORDERS
  ========================= */

  const loadOrders = async () => {
    if (!supabase || !user) {
      return;
    }

    setOrdersLoading(true);

    try {
      const {
        data,
        error
      } = await supabase
        .from("orders")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order("created_at", {
          ascending: false
        });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error(
        "Orders error:",
        error
      );

      alert(
        error?.message ||
          "COULD NOT LOAD ORDERS."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrders = async () => {
    if (!user) {
      openAuth("login");
      return;
    }

    setOrdersOpen(true);
    await loadOrders();
  };

  const modalVariants =
    productModal?.variants || [];

  const selectedVariantData =
    modalVariants[
      selectedVariant
    ] || null;

  return (
    <div className="site">
      <div className="top-strip">
        <p>
          FREE SHIPPING ON ORDERS ABOVE
          ₹1999
        </p>

        <p className="top-strip-right">
          WEIRD GANG WORLDWIDE
        </p>
      </div>

      <header className="header">
        <button
          className="icon-btn mobile-menu-btn"
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        <a href="#" className="logo">
          WEIRD
          <span>CULTURE</span>
        </a>

        <nav className="desktop-nav">
          <a href="#shop">
            SHOP
          </a>

          <button
            onClick={
              scrollToNewDrop
            }
          >
            NEW DROP
          </button>

          <a href="#collections">
            COLLECTIONS
          </a>

          <a href="#weird-gang">
            WEIRD GANG
          </a>
        </nav>

        <div className="header-actions">
          <button
            className="icon-btn search-btn"
            onClick={() =>
              setSearchOpen(
                (value) => !value
              )
            }
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <button
            className="icon-btn account-btn"
            onClick={() => {
              if (user) {
                setAccountOpen(
                  true
                );
              } else {
                openAuth("login");
              }
            }}
            aria-label="Account"
          >
            <User size={19} />
          </button>

          <button
            className={`cart-btn ${
              cartCount > 0
                ? "has-items"
                : ""
            }`}
            onClick={() =>
              setCartOpen(true)
            }
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            <span>
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* SEARCH */}

      {searchOpen && (
        <div className="search-panel">
          <Search size={19} />

          <input
            autoFocus
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="SEARCH THE CULTURE..."
          />

          <button
            className="close-search"
            onClick={() => {
              setSearchOpen(
                false
              );
              setSearch("");
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* MOBILE MENU */}

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
            <a
              href="#shop"
              onClick={closeMenu}
            >
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

            <a
              href="#collections"
              onClick={closeMenu}
            >
              COLLECTIONS
            </a>

            <a
              href="#weird-gang"
              onClick={closeMenu}
            >
              WEIRD GANG
            </a>

            <button
              onClick={() => {
                closeMenu();

                if (user) {
                  setAccountOpen(
                    true
                  );
                } else {
                  openAuth("login");
                }
              }}
            >
              ACCOUNT
            </button>
          </nav>

          <div className="mobile-menu-bottom">
            <span>
              EST. 2026
            </span>

            <span>
              WEIRD CULTURE
            </span>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL */}

      {productModal && (
        <div
          className="product-modal-backdrop"
          onClick={
            closeProductOptions
          }
        >
          <div
            className="product-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="product-modal-close"
              onClick={
                closeProductOptions
              }
              aria-label="Close product"
            >
              <X size={21} />
            </button>

            {modalVariants.length >
            0 ? (
              <div
                ref={carouselRef}
                className="product-carousel"
                onScroll={
                  handleCarouselScroll
                }
              >
                {modalVariants.map(
                  (
                    variant,
                    index
                  ) => (
                    <div
                      key={
                        variant.name
                      }
                      className={`product-carousel-slide ${
                        selectedVariant ===
                        index
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        selectCarouselVariant(
                          index
                        )
                      }
                    >
                      <div className="product-modal-image">
                        <img
                          src={
                            variant.image
                          }
                          alt={`${productModal.name} ${variant.name}`}
                        />

                        {productModal.tag && (
                          <span className="product-modal-tag">
                            {
                              productModal.tag
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="product-modal-image">
                <img
                  src={
                    productModal.image
                  }
                  alt={
                    productModal.name
                  }
                />

                {productModal.tag && (
                  <span className="product-modal-tag">
                    {
                      productModal.tag
                    }
                  </span>
                )}
              </div>
            )}

            {modalVariants.length >
              1 && (
              <div className="product-carousel-dots">
                {modalVariants.map(
                  (
                    variant,
                    index
                  ) => (
                    <button
                      key={
                        variant.name
                      }
                      type="button"
                      className={`product-carousel-dot ${
                        selectedVariant ===
                        index
                          ? "active"
                          : ""
                      }`}
                      aria-label={`Select ${variant.name}`}
                      onClick={() =>
                        selectCarouselVariant(
                          index
                        )
                      }
                    />
                  )
                )}
              </div>
            )}

            <div className="product-modal-info">
              <span className="product-modal-category">
                {
                  productModal.category
                }
              </span>

              <h2>
                {productModal.name}
              </h2>

              <strong className="product-modal-price">
                {money(
                  productModal.price
                )}
              </strong>

              {modalVariants.length >
                0 && (
                <div className="selected-design">
                  <span>
                    DESIGN
                  </span>

                  <strong>
                    {selectedVariantData?.name ||
                      ""}
                  </strong>
                </div>
              )}

              <div className="option-section">
                <div className="option-title">
                  <span>
                    SIZE
                  </span>

                  <strong>
                    {selectedSize ||
                      "SELECT SIZE"}
                  </strong>
                </div>

                <div className="size-options">
                  {sizes.map(
                    (size) => (
                      <button
                        key={size}
                        className={
                          selectedSize ===
                          size
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setSelectedSize(
                            size
                          )
                        }
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="modal-bottom">
                <div className="modal-quantity">
                  <button
                    onClick={() =>
                      setSelectedQuantity(
                        (value) =>
                          Math.max(
                            1,
                            value -
                              1
                          )
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>

                  <span>
                    {
                      selectedQuantity
                    }
                  </span>

                  <button
                    onClick={() =>
                      setSelectedQuantity(
                        (value) =>
                          value + 1
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  className="modal-add-btn"
                  onClick={
                    handleProductAdd
                  }
                >
                  <span>
                    ADD TO CART
                  </span>

                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART BACKDROP */}

      {cartOpen && (
        <div
          className="cart-backdrop"
          onClick={() =>
            setCartOpen(false)
          }
        />
      )}

      {/* CART */}

      <aside
        className={`cart-drawer ${
          cartOpen ? "open" : ""
        }`}
      >
        <div className="cart-header">
          <div>
            <span className="cart-kicker">
              YOUR BAG
            </span>

            <h2>
              CART
              <span>
                {cartCount}
              </span>
            </h2>
          </div>

          <button
            className="drawer-close"
            onClick={() =>
              setCartOpen(false)
            }
          >
            <X size={21} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag
              size={36}
              strokeWidth={1.2}
            />

            <h3>
              YOUR BAG IS EMPTY.
            </h3>

            <p>
              NOTHING WEIRD IN HERE
              YET.
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
                <div
                  className="cart-item"
                  key={
                    item.cartKey
                  }
                >
                  <div className="cart-item-image">
                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                    />
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <div>
                        <h3>
                          {
                            item.name
                          }
                        </h3>

                        {item.variantName && (
                          <span>
                            {
                              item.variantName
                            }
                            {item.size
                              ? ` · SIZE ${item.size}`
                              : ""}
                          </span>
                        )}

                        {!item.variantName &&
                          item.size && (
                            <span>
                              SIZE{" "}
                              {
                                item.size
                              }
                            </span>
                          )}

                        {!item.variantName &&
                          !item.size &&
                          item.tag && (
                            <span>
                              {
                                item.tag
                              }
                            </span>
                          )}
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() =>
                          removeFromCart(
                            item.cartKey
                          )
                        }
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.cartKey
                            )
                          }
                        >
                          <Minus
                            size={13}
                          />
                        </button>

                        <span>
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.cartKey
                            )
                          }
                        >
                          <Plus
                            size={13}
                          />
                        </button>
                      </div>

                      <strong>
                        {money(
                          item.price *
                            item.quantity
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>
                  SUBTOTAL
                </span>

                <strong>
                  {money(
                    cartTotal
                  )}
                </strong>
              </div>

              <p className="cart-note">
                {shipping === 0
                  ? "FREE SHIPPING"
                  : "SHIPPING ₹99 · FREE ABOVE ₹1999"}
              </p>

              <button
                className="checkout-btn"
                onClick={
                  openCheckout
                }
              >
                CHECKOUT
                <ArrowRight size={17} />
              </button>

              <button
                className="continue-btn"
                onClick={() =>
                  setCartOpen(
                    false
                  )
                }
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </>
        )}
      </aside>

      {/* AUTH */}

      {authOpen && (
        <div
          className="auth-backdrop"
          onClick={closeAuth}
        >
          <div
            className="auth-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="auth-close"
              onClick={closeAuth}
            >
              <X size={20} />
            </button>

            <div className="auth-brand">
              WEIRD
              <span>
                CULTURE
              </span>
            </div>

            <span className="auth-kicker">
              {authMode ===
              "login"
                ? "WEIRD GANG / LOGIN"
                : "WEIRD GANG / JOIN"}
            </span>

            <h2>
              {authMode ===
              "login"
                ? "WELCOME BACK."
                : "JOIN THE GANG."}
            </h2>

            <p className="auth-copy">
              {authMode ===
              "login"
                ? "LOG IN TO YOUR WEIRD CULTURE ACCOUNT AND CONTINUE YOUR JOURNEY."
                : "CREATE YOUR WEIRD CULTURE ACCOUNT AND STAY CLOSE TO THE NEXT DROP."}
            </p>

            <form
              className="auth-form"
              onSubmit={handleAuth}
            >
              {authMode ===
                "signup" && (
                <input
                  type="text"
                  placeholder="FULL NAME"
                  value={
                    authForm.fullName
                  }
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      fullName:
                        e.target.value
                    })
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={
                  authForm.email
                }
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    email:
                      e.target.value
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="PASSWORD"
                value={
                  authForm.password
                }
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    password:
                      e.target.value
                  })
                }
                minLength={6}
                required
              />

              <button
                className="auth-submit"
                type="submit"
              >
                {authMode ===
                "login"
                  ? "LOG IN"
                  : "CREATE ACCOUNT"}

                <ArrowRight size={17} />
              </button>
            </form>

            <div className="auth-switch">
              <span>
                {authMode ===
                "login"
                  ? "DON'T HAVE AN ACCOUNT?"
                  : "ALREADY IN THE GANG?"}
              </span>

              <button
                onClick={() =>
                  setAuthMode(
                    authMode ===
                      "login"
                      ? "signup"
                      : "login"
                  )
                }
              >
                {authMode ===
                "login"
                  ? "CREATE ACCOUNT"
                  : "LOG IN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT */}

      {accountOpen && (
        <div
          className="side-panel-backdrop"
          onClick={() =>
            setAccountOpen(
              false
            )
          }
        >
          <aside
            className="account-panel"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="account-panel-head">
              <div>
                <span>
                  WEIRD GANG / ACCOUNT
                </span>

                <h2>
                  ACCOUNT
                </h2>
              </div>

              <button
                className="drawer-close"
                onClick={() =>
                  setAccountOpen(
                    false
                  )
                }
              >
                <X size={21} />
              </button>
            </div>

            <div className="account-card">
              <div className="account-avatar">
                <User size={23} />
              </div>

              <div>
                <strong>
                  {user
                    ?.user_metadata
                    ?.full_name ||
                    "WEIRD MEMBER"}
                </strong>

                <span>
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              className="account-action"
              onClick={() => {
                setAccountOpen(
                  false
                );
                openOrders();
              }}
            >
              <Package size={18} />
              <span>
                MY ORDERS
              </span>
              <ChevronRight size={16} />
            </button>

            <button
              className="account-action logout-action"
              onClick={logout}
            >
              <LogOut size={18} />
              <span>
                LOG OUT
              </span>
              <ChevronRight size={16} />
            </button>
          </aside>
        </div>
      )}

      {/* CHECKOUT */}

      {checkoutOpen && (
        <div
          className="checkout-backdrop"
          onClick={() =>
            setCheckoutOpen(
              false
            )
          }
        >
          <div
            className="checkout-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="checkout-close"
              onClick={() =>
                setCheckoutOpen(
                  false
                )
              }
            >
              <X size={20} />
            </button>

            <div className="checkout-heading">
              <span>
                WEIRD CULTURE / CHECKOUT
              </span>

              <h2>
                DELIVERY DETAILS.
              </h2>
            </div>

            <form
              className="checkout-form"
              onSubmit={
                placeOrder
              }
            >
              <div className="checkout-grid">
                <input
                  placeholder="FULL NAME"
                  value={
                    checkoutForm.fullName
                  }
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      fullName:
                        e.target.value
                    })
                  }
                  required
                />

                <input
                  placeholder="PHONE NUMBER"
                  inputMode="tel"
                  value={
                    checkoutForm.phone
                  }
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      phone:
                        e.target.value
                    })
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="EMAIL"
                  value={
                    checkoutForm.email
                  }
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      email:
                        e.target.value
                    })
                  }
                />

                <input
                  placeholder="PINCODE"
                  inputMode="numeric"
                  value={
                    checkoutForm.pincode
                  }
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      pincode:
                        e.target.value
                    })
                  }
                  required
                />

                <input
                  className="checkout-full"
                  placeholder="ADDRESS"
                  value={
                    checkoutForm.address
                  }
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      address:
                        e.target.value
                    })
                  }
                  required
                />

                <input
                  placeholder="CITY"
                  value={
                    checkoutForm.city
                  }
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      city:
                        e.target.value
                    })
                  }
                  required
                />

                <input
                  placeholder="STATE"
                  value={
                    checkoutForm.state
                  }
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      state:
                        e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="checkout-summary">
                <div>
                  <span>
                    SUBTOTAL
                  </span>

                  <strong>
                    {money(
                      cartTotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    SHIPPING
                  </span>

                  <strong>
                    {shipping ===
                    0
                      ? "FREE"
                      : money(
                          shipping
                        )}
                  </strong>
                </div>

                <div className="checkout-total">
                  <span>
                    TOTAL
                  </span>

                  <strong>
                    {money(
                      grandTotal
                    )}
                  </strong>
                </div>
              </div>

              <button
                className="place-order-btn"
                type="submit"
              >
                PLACE ORDER
                <ArrowRight size={17} />
              </button>

              <p className="checkout-payment-note">
                PAYMENT STATUS WILL
                REMAIN PENDING UNTIL
                PAYMENT IS CONNECTED.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ORDERS */}

      {ordersOpen && (
        <div
          className="side-panel-backdrop"
          onClick={() =>
            setOrdersOpen(
              false
            )
          }
        >
          <aside
            className="orders-panel"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="account-panel-head">
              <div>
                <span>
                  WEIRD GANG / HISTORY
                </span>

                <h2>
                  MY ORDERS
                </h2>
              </div>

              <button
                className="drawer-close"
                onClick={() =>
                  setOrdersOpen(
                    false
                  )
                }
              >
                <X size={21} />
              </button>
            </div>

            {ordersLoading ? (
              <div className="orders-empty">
                LOADING ORDERS...
              </div>
            ) : orders.length ===
              0 ? (
              <div className="orders-empty">
                <Package size={35} />

                <h3>
                  NO ORDERS YET.
                </h3>

                <p>
                  YOUR NEXT DROP
                  STARTS HERE.
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(
                  (order) => (
                    <div
                      className="order-card"
                      key={
                        order.id
                      }
                    >
                      <div className="order-card-top">
                        <div>
                          <span>
                            ORDER
                          </span>

                          <strong>
                            #
                            {order.id
                              .slice(
                                0,
                                8
                              )
                              .toUpperCase()}
                          </strong>
                        </div>

                        <span
                          className={`order-status ${String(
                            order.status
                          ).toLowerCase()}`}
                        >
                          {
                            order.status
                          }
                        </span>
                      </div>

                      <div className="order-items-mini">
                        {Array.isArray(
                          order.items
                        ) &&
                          order.items.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={`${order.id}-${index}`}
                              >
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                />

                                <div>
                                  <strong>
                                    {
                                      item.name
                                    }
                                  </strong>

                                  <span>
                                    {item.variant
                                      ? `${item.variant} · `
                                      : ""}
                                    SIZE{" "}
                                    {item.size ||
                                      "-"}{" "}
                                    · QTY{" "}
                                    {
                                      item.quantity
                                    }
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                      </div>

                      <div className="order-card-bottom">
                        <span>
                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>

                        <strong>
                          {money(
                            order.total
                          )}
                        </strong>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* =========================
          MAIN WEBSITE
      ========================= */}

      <main>
        {/* HERO */}

        <section className="hero">
          <div className="hero-image-wrap">
            <img
              src={image(
                "IMG_0915.jpeg"
              )}
              alt="WEIRD CULTURE streetwear"
              className="hero-image"
            />

            <div className="hero-overlay" />
          </div>

          <div className="hero-content">
            <div className="hero-kicker">
              <span className="red-dot" />
              UNDERGROUND / INDIA /
              2026
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
                onClick={
                  scrollToProducts
                }
              >
                <span>
                  SHOP THE CULTURE
                </span>

                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <div className="hero-scroll">
            <ArrowDown size={15} />
            SCROLL TO EXPLORE
          </div>
        </section>

        {/* MARQUEE */}

        <section className="marquee">
          <div className="marquee-track">
            <span>
              WEIRD CULTURE
            </span>

            <i>✦</i>

            <span>
              WEIRD GANG
            </span>

            <i>✦</i>

            <span>
              NO NORMAL PEOPLE
            </span>

            <i>✦</i>

            <span>
              WEIRD CULTURE
            </span>

            <i>✦</i>

            <span>
              WEIRD GANG
            </span>

            <i>✦</i>
          </div>
        </section>

        {/* SHOP */}

        <section
          className="shop-section"
          id="shop"
        >
          <div className="section-head">
            <div>
              <span className="section-label">
                01 / SHOP
              </span>

              <h2>
                THE CULTURE
              </h2>
            </div>

            <p>
              GRAPHICS. ATTITUDE.
              <br />
              NOTHING ORDINARY.
            </p>
          </div>

          <div className="category-bar">
            {categories.map(
              (category) => (
                <button
                  key={category}
                  className={
                    activeCategory ===
                    category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                >
                  {category}

                  {category ===
                    "NEW DROP" && (
                    <span className="category-dot" />
                  )}
                </button>
              )
            )}
          </div>

          <div className="shop-status">
            <span>
              {activeCategory ===
              "NEW DROP"
                ? "LATEST DROP"
                : "ALL PIECES"}
            </span>

            <span>
              {
                filteredProducts.length
              }{" "}
              PRODUCTS
            </span>
          </div>

          <div className="product-grid">
            {filteredProducts.map(
              (
                product,
                index
              ) => (
                <article
                  className={`product-card ${
                    index === 0 ||
                    index === 5
                      ? "product-card-large"
                      : ""
                  }`}
                  key={
                    product.id
                  }
                >
                  <div className="product-image-wrap">
                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                      className="product-image"
                    />

                    {product.tag && (
                      <span className="product-tag">
                        {
                          product.tag
                        }
                      </span>
                    )}

                    <button
                      className="quick-add"
                      onClick={() =>
                        openProductOptions(
                          product
                        )
                      }
                    >
                      <span>
                        VIEW PRODUCT
                      </span>

                      <ArrowRight
                        size={15}
                      />
                    </button>
                  </div>

                  <div className="product-info">
                    <div>
                      <h3>
                        {
                          product.name
                        }
                      </h3>

                      <span>
                        {product.tag ||
                          "WEIRD CULTURE"}
                      </span>
                    </div>

                    <strong>
                      {money(
                        product.price
                      )}
                    </strong>
                  </div>
                </article>
              )
            )}
          </div>

          {filteredProducts.length ===
            0 && (
            <div className="empty-state">
              <h3>
                NOTHING FOUND.
              </h3>

              <p>
                TRY ANOTHER SEARCH.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory(
                    "ALL"
                  );
                }}
              >
                RESET SHOP
              </button>
            </div>
          )}
        </section>

        {/* NEW DROP */}

        <section
          className="statement"
          id="new-drop"
        >
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
              <span>
                WEIRD.
              </span>
            </h2>

            <p className="statement-copy">
              THE LATEST PIECES FROM
              WEIRD CULTURE.
              <br />
              HEAVY GRAPHICS. OVERSIZED
              FITS.
              <br />
              RAW ENERGY. NOTHING
              NORMAL.
            </p>

            <div className="new-drop-pills">
              <span>
                01 / HEAVY PRINTED LS
              </span>

              <span>
                02 / REAL TREE CARGO
              </span>
            </div>

            <button
              className="outline-btn"
              onClick={
                scrollToNewDrop
              }
            >
              <span>
                SHOP NEW DROP
              </span>

              <ArrowRight size={17} />
            </button>
          </div>

          <div className="statement-image">
            <img
              src={image(
                "IMG_0913.jpeg"
              )}
              alt="WEIRD CULTURE New Drop"
            />

            <div className="new-drop-stamp">
              NEW
              <strong>
                DROP
              </strong>
              2026
            </div>
          </div>
        </section>

        {/* COLLECTIONS */}

        <section
          className="collection-section"
          id="collections"
        >
          <div className="collection-header">
            <span className="section-label">
              03 / COLLECTIONS
            </span>

            <h2>
              BUILT DIFFERENT.
            </h2>
          </div>

          <div className="collection-grid">
            <div className="collection-card collection-wide">
              <img
                src={image(
                  "IMG_0914.jpeg"
                )}
                alt="Tees collection"
              />

              <div className="collection-overlay">
                <span>01</span>

                <h3>
                  GRAPHIC TEES
                </h3>

                <button
                  onClick={
                    scrollToProducts
                  }
                >
                  EXPLORE
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            </div>

            <div className="collection-card">
              <img
                src={image(
                  "IMG_0915.jpeg"
                )}
                alt="Pants collection"
              />

              <div className="collection-overlay">
                <span>02</span>

                <h3>
                  BAGGY PANTS
                </h3>

                <button
                  onClick={() => {
                    setActiveCategory(
                      "PANTS"
                    );

                    document
                      .getElementById(
                        "shop"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth"
                      });
                  }}
                >
                  EXPLORE
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            </div>

            <div className="collection-card">
              <img
                src={image(
                  "IMG_0916.jpeg"
                )}
                alt="Jersey collection"
              />

              <div className="collection-overlay">
                <span>03</span>

                <h3>
                  JERSEYS
                </h3>

                <button
                  onClick={() => {
                    setActiveCategory(
                      "JERSEYS"
                    );

                    document
                      .getElementById(
                        "shop"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth"
                      });
                  }}
                >
                  EXPLORE
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* GANG */}

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
              <span>
                WEIRD GANG.
              </span>
            </h2>

            <p>
              WEAR WHAT YOU WANT.
              <br />
              BE WHO YOU ARE.
              <br />
              NEVER FIT IN.
            </p>

            <button className="primary-btn">
              <span>
                @WEIRDCULTURE
              </span>

              <ArrowRight size={18} />
            </button>
          </div>

          <div className="gang-image">
            <img
              src={image(
                "IMG_0911.jpeg"
              )}
              alt="WEIRD GANG"
            />

            <div className="gang-stamp">
              <span>
                WEIRD
              </span>

              <strong>
                GANG
              </strong>

              <span>
                EST. 2026
              </span>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}

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

              alert(
                "YOU'RE IN THE WEIRD GANG."
              );
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

      {/* FOOTER */}

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo footer-logo">
              WEIRD
              <span>
                CULTURE
              </span>
            </div>

            <p>
              FOR THE WEIRD.
              <br />
              AGAINST THE NORMAL.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <span>
                SHOP
              </span>

              <a href="#shop">
                ALL PRODUCTS
              </a>

              <button
                onClick={
                  scrollToNewDrop
                }
              >
                NEW DROP
              </button>

              <a href="#collections">
                COLLECTIONS
              </a>
            </div>

            <div>
              <span>
                INFO
              </span>

              <a href="#">
                ABOUT US
              </a>

              <a href="#">
                SHIPPING
              </a>

              <a href="#">
                CONTACT
              </a>
            </div>

            <div>
              <span>
                SOCIAL
              </span>

              <a href="#">
                INSTAGRAM
              </a>

              <a href="#weird-gang">
                WEIRD GANG
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 WEIRD CULTURE
          </span>

          <span>
            MADE FOR THE WEIRD.
          </span>

          <span>
            INDIA
          </span>
        </div>
      </footer>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);