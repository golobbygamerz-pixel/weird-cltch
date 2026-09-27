import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  IndianRupee,
  LayoutDashboard,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  X
} from "lucide-react";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED"
];

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
};

function AdminPanel({
  supabase,
  user,
  products = [],
  onClose
}) {
  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [orders, setOrders] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [orderSearch, setOrderSearch] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [savingOrder, setSavingOrder] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  /* =========================
     LOAD ADMIN DATA
  ========================= */

  const loadAdminData = async (
    showRefresh = false
  ) => {
    if (!supabase || !user) {
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const [
        ordersResult,
        customersResult
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", {
            ascending: false
          }),

        supabase
          .from("profiles")
          .select("*")
          .order("created_at", {
            ascending: false
          })
      ]);

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (customersResult.error) {
        throw customersResult.error;
      }

      setOrders(
        ordersResult.data || []
      );

      setCustomers(
        customersResult.data || []
      );
    } catch (error) {
      console.error(
        "Admin data error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "COULD NOT LOAD ADMIN DATA."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  /* =========================
     METRICS
  ========================= */

  const metrics = useMemo(() => {
    const totalOrders =
      orders.length;

    const pending =
      orders.filter(
        (order) =>
          order.status ===
          "PENDING"
      ).length;

    const processing =
      orders.filter(
        (order) =>
          [
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED"
          ].includes(
            order.status
          )
      ).length;

    const delivered =
      orders.filter(
        (order) =>
          order.status ===
          "DELIVERED"
      ).length;

    const cancelled =
      orders.filter(
        (order) =>
          order.status ===
          "CANCELLED"
      ).length;

    const totalValue =
      orders.reduce(
        (sum, order) =>
          sum +
          Number(
            order.total || 0
          ),
        0
      );

    const paidRevenue =
      orders
        .filter(
          (order) =>
            order.payment_status ===
            "PAID"
        )
        .reduce(
          (sum, order) =>
            sum +
            Number(
              order.total || 0
            ),
          0
        );

    return {
      totalOrders,
      pending,
      processing,
      delivered,
      cancelled,
      totalValue,
      paidRevenue
    };
  }, [orders]);

  /* =========================
     FILTER ORDERS
  ========================= */

  const filteredOrders =
    useMemo(() => {
      const query =
        orderSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return orders;
      }

      return orders.filter(
        (order) => {
          const text = [
            order.id,
            order.customer_name,
            order.phone,
            order.email,
            order.status,
            order.payment_status,
            order.city,
            order.pincode
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(
            query
          );
        }
      );
    }, [
      orders,
      orderSearch
    ]);

  /* =========================
     FILTER CUSTOMERS
  ========================= */

  const filteredCustomers =
    useMemo(() => {
      const query =
        customerSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return customers;
      }

      return customers.filter(
        (customer) => {
          const text = [
            customer.full_name,
            customer.phone,
            customer.city,
            customer.state,
            customer.pincode,
            customer.id
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(
            query
          );
        }
      );
    }, [
      customers,
      customerSearch
    ]);

  /* =========================
     UPDATE ORDER
  ========================= */

  const updateOrder = async (
    orderId,
    status,
    paymentStatus
  ) => {
    if (!supabase) {
      return;
    }

    setSavingOrder(orderId);

    try {
      const {
        data,
        error
      } = await supabase
        .from("orders")
        .update({
          status,
          payment_status:
            paymentStatus
        })
        .eq(
          "id",
          orderId
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      setOrders(
        (current) =>
          current.map(
            (order) =>
              order.id ===
              orderId
                ? data
                : order
          )
      );

      setSelectedOrder(
        data
      );

      alert(
        "ORDER UPDATED SUCCESSFULLY."
      );
    } catch (error) {
      console.error(
        "Order update error:",
        error
      );

      alert(
        error?.message ||
          "COULD NOT UPDATE ORDER."
      );
    } finally {
      setSavingOrder("");
    }
  };

  /* =========================
     SIDEBAR
  ========================= */

  const tabs = [
    {
      id: "dashboard",
      label: "DASHBOARD",
      icon: LayoutDashboard
    },
    {
      id: "orders",
      label: "ORDERS",
      icon: ShoppingBag
    },
    {
      id: "customers",
      label: "CUSTOMERS",
      icon: Users
    },
    {
      id: "catalog",
      label: "CATALOG",
      icon: Package
    }
  ];

  /* =========================
     ORDER DETAIL
  ========================= */

  const OrderDetail = () => {
    if (!selectedOrder) {
      return null;
    }

    return (
      <div
        className="wc-admin-detail-backdrop"
        onClick={() =>
          setSelectedOrder(null)
        }
      >
        <div
          className="wc-admin-detail"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="wc-admin-detail-head">
            <div>
              <span>
                ORDER DETAIL
              </span>

              <h2>
                #
                {selectedOrder.id
                  .slice(0, 8)
                  .toUpperCase()}
              </h2>
            </div>

            <button
              onClick={() =>
                setSelectedOrder(
                  null
                )
              }
            >
              <X size={19} />
            </button>
          </div>

          <div className="wc-admin-customer-box">
            <div>
              <span>
                CUSTOMER
              </span>

              <strong>
                {
                  selectedOrder.customer_name
                }
              </strong>
            </div>

            <div>
              <span>
                EMAIL
              </span>

              <strong>
                {
                  selectedOrder.email ||
                    "-"
                }
              </strong>
            </div>

            <div>
              <span>
                PHONE
              </span>

              <strong>
                {
                  selectedOrder.phone
                }
              </strong>
            </div>

            <div>
              <span>
                ADDRESS
              </span>

              <strong>
                {
                  selectedOrder.address
                }
                <br />
                {
                  selectedOrder.city
                }
                ,{" "}
                {
                  selectedOrder.state
                }{" "}
                -{" "}
                {
                  selectedOrder.pincode
                }
              </strong>
            </div>
          </div>

          <div className="wc-admin-detail-section">
            <div className="wc-admin-detail-title">
              PRODUCTS
            </div>

            <div className="wc-admin-detail-items">
              {Array.isArray(
                selectedOrder.items
              ) &&
                selectedOrder.items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="wc-admin-detail-item"
                      key={`${selectedOrder.id}-${index}`}
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

                      <b>
                        {money(
                          Number(
                            item.price
                          ) *
                            Number(
                              item.quantity
                            )
                        )}
                      </b>
                    </div>
                  )
                )}
            </div>
          </div>

          <div className="wc-admin-total-box">
            <div>
              <span>
                SUBTOTAL
              </span>

              <strong>
                {money(
                  selectedOrder.subtotal
                )}
              </strong>
            </div>

            <div>
              <span>
                SHIPPING
              </span>

              <strong>
                {money(
                  selectedOrder.shipping
                )}
              </strong>
            </div>

            <div className="total">
              <span>
                TOTAL
              </span>

              <strong>
                {money(
                  selectedOrder.total
                )}
              </strong>
            </div>
          </div>

          <div className="wc-admin-status-editor">
            <div>
              <label>
                ORDER STATUS
              </label>

              <select
                value={
                  selectedOrder.status
                }
                onChange={(event) =>
                  setSelectedOrder(
                    (current) => ({
                      ...current,
                      status:
                        event.target
                          .value
                    })
                  )
                }
              >
                {ORDER_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label>
                PAYMENT STATUS
              </label>

              <select
                value={
                  selectedOrder.payment_status
                }
                onChange={(event) =>
                  setSelectedOrder(
                    (current) => ({
                      ...current,
                      payment_status:
                        event.target
                          .value
                    })
                  )
                }
              >
                {PAYMENT_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <button
            className="wc-admin-save"
            disabled={
              savingOrder ===
              selectedOrder.id
            }
            onClick={() =>
              updateOrder(
                selectedOrder.id,
                selectedOrder.status,
                selectedOrder.payment_status
              )
            }
          >
            {savingOrder ===
            selectedOrder.id
              ? "SAVING..."
              : "SAVE ORDER"}
          </button>

          <div className="wc-admin-order-date">
            ORDERED{" "}
            {formatDate(
              selectedOrder.created_at
            )}
          </div>
        </div>
      </div>
    );
  };

  /* =========================
     DASHBOARD
  ========================= */

  const Dashboard = () => (
    <div className="wc-admin-content">
      <div className="wc-admin-page-title">
        <div>
          <span>
            WEIRD CULTURE / ADMIN
          </span>

          <h1>
            DASHBOARD.
          </h1>
        </div>

        <button
          className="wc-admin-refresh"
          onClick={() =>
            loadAdminData(true)
          }
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "wc-spin"
                : ""
            }
          />

          REFRESH
        </button>
      </div>

      {errorMessage && (
        <div className="wc-admin-error">
          {errorMessage}
        </div>
      )}

      <div className="wc-admin-stats">
        <Stat
          icon={ShoppingBag}
          label="TOTAL ORDERS"
          value={
            metrics.totalOrders
          }
        />

        <Stat
          icon={Clock3}
          label="PENDING"
          value={
            metrics.pending
          }
        />

        <Stat
          icon={Truck}
          label="PROCESSING"
          value={
            metrics.processing
          }
        />

        <Stat
          icon={Check}
          label="DELIVERED"
          value={
            metrics.delivered
          }
        />

        <Stat
          icon={Users}
          label="CUSTOMERS"
          value={
            customers.length
          }
        />

        <Stat
          icon={IndianRupee}
          label="PAID REVENUE"
          value={money(
            metrics.paidRevenue
          )}
        />
      </div>

      <div className="wc-admin-dashboard-grid">
        <div className="wc-admin-panel-card">
          <div className="wc-admin-card-head">
            <div>
              <span>
                ORDER VALUE
              </span>

              <h3>
                {money(
                  metrics.totalValue
                )}
              </h3>
            </div>

            <BarChart3
              size={20}
            />
          </div>

          <div className="wc-admin-breakdown">
            <div>
              <span>
                PENDING
              </span>

              <b>
                {metrics.pending}
              </b>
            </div>

            <div>
              <span>
                PROCESSING
              </span>

              <b>
                {metrics.processing}
              </b>
            </div>

            <div>
              <span>
                DELIVERED
              </span>

              <b>
                {metrics.delivered}
              </b>
            </div>

            <div>
              <span>
                CANCELLED
              </span>

              <b>
                {metrics.cancelled}
              </b>
            </div>
          </div>
        </div>

        <div className="wc-admin-panel-card">
          <div className="wc-admin-card-head">
            <div>
              <span>
                RECENT ORDERS
              </span>

              <h3>
                {orders.length}
              </h3>
            </div>

            <ShoppingBag
              size={20}
            />
          </div>

          <div className="wc-admin-recent">
            {orders
              .slice(0, 5)
              .map((order) => (
                <button
                  key={order.id}
                  onClick={() =>
                    setSelectedOrder(
                      order
                    )
                  }
                >
                  <div>
                    <strong>
                      #
                      {order.id
                        .slice(
                          0,
                          8
                        )
                        .toUpperCase()}
                    </strong>

                    <span>
                      {
                        order.customer_name
                      }
                    </span>
                  </div>

                  <div>
                    <b>
                      {money(
                        order.total
                      )}
                    </b>

                    <span
                      className={`wc-status ${String(
                        order.status
                      ).toLowerCase()}`}
                    >
                      {
                        order.status
                      }
                    </span>
                  </div>
                </button>
              ))}

            {!orders.length && (
              <div className="wc-admin-empty-small">
                NO ORDERS YET.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* =========================
     ORDERS PAGE
  ========================= */

  const OrdersPage = () => (
    <div className="wc-admin-content">
      <div className="wc-admin-page-title">
        <div>
          <span>
            WEIRD CULTURE / ORDERS
          </span>

          <h1>
            ORDERS.
          </h1>
        </div>
      </div>

      <div className="wc-admin-search">
        <Search size={17} />

        <input
          value={orderSearch}
          onChange={(event) =>
            setOrderSearch(
              event.target.value
            )
          }
          placeholder="SEARCH ORDERS, CUSTOMER, PHONE..."
        />
      </div>

      <div className="wc-admin-orders">
        {filteredOrders.map(
          (order) => (
            <div
              className="wc-admin-order-row"
              key={order.id}
            >
              <div className="wc-order-main">
                <span className="wc-order-number">
                  #
                  {order.id
                    .slice(
                      0,
                      8
                    )
                    .toUpperCase()}
                </span>

                <strong>
                  {
                    order.customer_name
                  }
                </strong>

                <span>
                  {
                    order.phone
                  }
                </span>
              </div>

              <div className="wc-order-products">
                <span>
                  {Array.isArray(
                    order.items
                  )
                    ? order.items
                        .map(
                          (
                            item
                          ) =>
                            `${item.name} ×${item.quantity}`
                        )
                        .join(
                          ", "
                        )
                    : "-"}
                </span>
              </div>

              <div className="wc-order-total">
                <strong>
                  {money(
                    order.total
                  )}
                </strong>

                <span>
                  {
                    order.payment_status
                  }
                </span>
              </div>

              <div>
                <span
                  className={`wc-status ${String(
                    order.status
                  ).toLowerCase()}`}
                >
                  {
                    order.status
                  }
                </span>
              </div>

              <button
                className="wc-view-order"
                onClick={() =>
                  setSelectedOrder(
                    order
                  )
                }
              >
                <Eye
                  size={16}
                />

                VIEW
              </button>
            </div>
          )
        )}

        {!filteredOrders.length && (
          <div className="wc-admin-empty">
            NO ORDERS FOUND.
          </div>
        )}
      </div>
    </div>
  );

  /* =========================
     CUSTOMERS PAGE
  ========================= */

  const CustomersPage = () => (
    <div className="wc-admin-content">
      <div className="wc-admin-page-title">
        <div>
          <span>
            WEIRD CULTURE / USERS
          </span>

          <h1>
            CUSTOMERS.
          </h1>
        </div>
      </div>

      <div className="wc-admin-search">
        <Search size={17} />

        <input
          value={
            customerSearch
          }
          onChange={(event) =>
            setCustomerSearch(
              event.target.value
            )
          }
          placeholder="SEARCH CUSTOMERS..."
        />
      </div>

      <div className="wc-admin-customer-list">
        {filteredCustomers.map(
          (customer) => (
            <div
              className="wc-admin-customer-row"
              key={
                customer.id
              }
            >
              <div className="wc-customer-avatar">
                {(customer.full_name ||
                  "W")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {customer.full_name ||
                    "WEIRD MEMBER"}
                </strong>

                <span>
                  {customer.id
                    .slice(
                      0,
                      8
                    )
                    .toUpperCase()}
                </span>
              </div>

              <div>
                <span>
                  PHONE
                </span>

                <strong>
                  {customer.phone ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  LOCATION
                </span>

                <strong>
                  {customer.city ||
                    "-"}
                  {customer.state
                    ? `, ${customer.state}`
                    : ""}
                </strong>
              </div>

              <div>
                <span>
                  JOINED
                </span>

                <strong>
                  {formatDate(
                    customer.created_at
                  )}
                </strong>
              </div>
            </div>
          )
        )}

        {!filteredCustomers.length && (
          <div className="wc-admin-empty">
            NO CUSTOMERS FOUND.
          </div>
        )}
      </div>
    </div>
  );

  /* =========================
     CATALOG PAGE
  ========================= */

  const CatalogPage = () => (
    <div className="wc-admin-content">
      <div className="wc-admin-page-title">
        <div>
          <span>
            WEIRD CULTURE / PRODUCTS
          </span>

          <h1>
            CATALOG.
          </h1>
        </div>
      </div>

      <div className="wc-admin-catalog">
        {products.map(
          (product) => (
            <div
              className="wc-admin-product"
              key={
                product.id
              }
            >
              <div className="wc-admin-product-image">
                <img
                  src={
                    product.image
                  }
                  alt={
                    product.name
                  }
                />

                {product.tag && (
                  <span>
                    {
                      product.tag
                    }
                  </span>
                )}
              </div>

              <div className="wc-admin-product-info">
                <span>
                  {
                    product.category
                  }
                </span>

                <h3>
                  {
                    product.name
                  }
                </h3>

                <strong>
                  {money(
                    product.price
                  )}
                </strong>

                {product.variants && (
                  <small>
                    {
                      product
                        .variants
                        .length
                    }{" "}
                    DESIGNS
                  </small>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );

  /* =========================
     MAIN ADMIN UI
  ========================= */

  return (
    <div className="wc-admin">
      <aside className="wc-admin-sidebar">
        <div className="wc-admin-brand">
          <span>
            WEIRD
          </span>

          <strong>
            CULTURE
          </strong>

          <small>
            ADMIN CONTROL
          </small>
        </div>

        <div className="wc-admin-user">
          <ShieldCheck
            size={17}
          />

          <div>
            <strong>
              ADMIN
            </strong>

            <span>
              {user?.email}
            </span>
          </div>
        </div>

        <nav className="wc-admin-nav">
          {tabs.map(
            ({
              id,
              label,
              icon: Icon
            }) => (
              <button
                key={id}
                className={
                  activeTab ===
                  id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    id
                  )
                }
              >
                <Icon
                  size={17}
                />

                <span>
                  {label}
                </span>
              </button>
            )
          )}
        </nav>

        <button
          className="wc-admin-exit"
          onClick={onClose}
        >
          <ArrowLeft
            size={17}
          />

          BACK TO STORE
        </button>
      </aside>

      <main className="wc-admin-main">
        <header className="wc-admin-mobile-head">
          <div>
            <span>
              WEIRD CULTURE
            </span>

            <strong>
              ADMIN
            </strong>
          </div>

          <button
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>

        {loading ? (
          <div className="wc-admin-loading">
            <RefreshCw
              size={22}
              className="wc-spin"
            />

            LOADING ADMIN PANEL...
          </div>
        ) : (
          <>
            {activeTab ===
              "dashboard" && (
              <Dashboard />
            )}

            {activeTab ===
              "orders" && (
              <OrdersPage />
            )}

            {activeTab ===
              "customers" && (
              <CustomersPage />
            )}

            {activeTab ===
              "catalog" && (
              <CatalogPage />
            )}
          </>
        )}
      </main>

      <OrderDetail />

      <style>{`
        .wc-admin {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          background: #080808;
          color: #f5f5f2;
          font-family: Inter, Arial, sans-serif;
          overflow: hidden;
        }

        .wc-admin * {
          box-sizing: border-box;
        }

        .wc-admin-sidebar {
          width: 250px;
          flex: 0 0 250px;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #252525;
          background: #0b0b0b;
          padding: 26px 18px 18px;
        }

        .wc-admin-brand {
          padding: 4px 10px 24px;
          border-bottom: 1px solid #252525;
        }

        .wc-admin-brand span,
        .wc-admin-brand strong {
          display: block;
          font-size: 24px;
          line-height: .9;
          letter-spacing: -.06em;
        }

        .wc-admin-brand strong {
          color: #d71920;
        }

        .wc-admin-brand small {
          display: block;
          margin-top: 14px;
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .2em;
        }

        .wc-admin-user {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 4px;
          padding: 12px;
          border: 1px solid #252525;
          background: #111;
        }

        .wc-admin-user svg {
          color: #d71920;
          flex: 0 0 auto;
        }

        .wc-admin-user strong,
        .wc-admin-user span {
          display: block;
        }

        .wc-admin-user strong {
          font-size: 10px;
          letter-spacing: .15em;
        }

        .wc-admin-user span {
          max-width: 170px;
          margin-top: 4px;
          color: #8a8a8a;
          font-size: 9px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wc-admin-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .wc-admin-nav button,
        .wc-admin-exit {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          border: 0;
          background: transparent;
          color: #8a8a8a;
          padding: 13px 12px;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .13em;
          cursor: pointer;
          transition: .2s ease;
        }

        .wc-admin-nav button:hover,
        .wc-admin-nav button.active {
          background: #f5f5f2;
          color: #080808;
        }

        .wc-admin-nav button.active svg {
          color: #d71920;
        }

        .wc-admin-exit {
          margin-top: auto;
          border-top: 1px solid #252525;
          padding-top: 18px;
        }

        .wc-admin-exit:hover {
          color: #f5f5f2;
        }

        .wc-admin-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(215,25,32,.055),
              transparent 30%
            ),
            #080808;
        }

        .wc-admin-mobile-head {
          display: none;
        }

        .wc-admin-content {
          width: min(1400px, 100%);
          margin: 0 auto;
          padding: 42px;
        }

        .wc-admin-page-title {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
        }

        .wc-admin-page-title span {
          color: #8a8a8a;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .2em;
        }

        .wc-admin-page-title h1 {
          margin: 7px 0 0;
          font-size: clamp(34px, 5vw, 68px);
          line-height: .9;
          letter-spacing: -.06em;
        }

        .wc-admin-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #252525;
          background: #111;
          color: #f5f5f2;
          padding: 11px 14px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
          cursor: pointer;
        }

        .wc-admin-error {
          margin-bottom: 18px;
          padding: 13px 15px;
          border: 1px solid rgba(215,25,32,.45);
          background: rgba(215,25,32,.08);
          color: #f5f5f2;
          font-size: 11px;
        }

        .wc-admin-stats {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }

        .wc-admin-stat {
          min-height: 125px;
          padding: 17px;
          border: 1px solid #252525;
          background: #111;
        }

        .wc-admin-stat-icon {
          color: #8a8a8a;
          margin-bottom: 24px;
        }

        .wc-admin-stat span,
        .wc-admin-stat strong {
          display: block;
        }

        .wc-admin-stat span {
          color: #8a8a8a;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
        }

        .wc-admin-stat strong {
          margin-top: 6px;
          font-size: 24px;
          letter-spacing: -.04em;
        }

        .wc-admin-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        .wc-admin-panel-card {
          min-height: 330px;
          padding: 22px;
          border: 1px solid #252525;
          background: #111;
        }

        .wc-admin-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 22px;
          border-bottom: 1px solid #252525;
        }

        .wc-admin-card-head span {
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .18em;
        }

        .wc-admin-card-head h3 {
          margin: 7px 0 0;
          font-size: 32px;
          letter-spacing: -.05em;
        }

        .wc-admin-card-head svg {
          color: #d71920;
        }

        .wc-admin-breakdown {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          margin-top: 20px;
          background: #252525;
        }

        .wc-admin-breakdown div {
          padding: 17px;
          background: #111;
        }

        .wc-admin-breakdown span,
        .wc-admin-breakdown b {
          display: block;
        }

        .wc-admin-breakdown span {
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .13em;
        }

        .wc-admin-breakdown b {
          margin-top: 6px;
          font-size: 20px;
        }

        .wc-admin-recent {
          margin-top: 8px;
        }

        .wc-admin-recent button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 15px;
          padding: 13px 0;
          border: 0;
          border-bottom: 1px solid #252525;
          background: transparent;
          color: #f5f5f2;
          text-align: left;
          cursor: pointer;
        }

        .wc-admin-recent button:last-child {
          border-bottom: 0;
        }

        .wc-admin-recent button > div:last-child {
          text-align: right;
        }

        .wc-admin-recent strong,
        .wc-admin-recent span {
          display: block;
        }

        .wc-admin-recent strong {
          font-size: 10px;
        }

        .wc-admin-recent span {
          margin-top: 4px;
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .08em;
        }

        .wc-status {
          display: inline-flex !important;
          width: fit-content;
          padding: 5px 7px;
          border: 1px solid #252525;
          font-size: 7px !important;
          font-weight: 700;
          letter-spacing: .1em;
        }

        .wc-status.delivered {
          color: #77d18b;
          border-color: rgba(119,209,139,.35);
        }

        .wc-status.cancelled {
          color: #d71920;
          border-color: rgba(215,25,32,.4);
        }

        .wc-status.pending {
          color: #e4b95b;
        }

        .wc-status.processing,
        .wc-status.shipped,
        .wc-status.confirmed {
          color: #8eb9ff;
        }

        .wc-admin-search {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 48px;
          margin-bottom: 14px;
          padding: 0 15px;
          border: 1px solid #252525;
          background: #111;
          color: #8a8a8a;
        }

        .wc-admin-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #f5f5f2;
          font: inherit;
          font-size: 10px;
          letter-spacing: .08em;
        }

        .wc-admin-orders {
          border: 1px solid #252525;
          background: #111;
        }

        .wc-admin-order-row {
          display: grid;
          grid-template-columns: 1.1fr 1.8fr .8fr .8fr auto;
          align-items: center;
          gap: 15px;
          padding: 17px;
          border-bottom: 1px solid #252525;
        }

        .wc-admin-order-row:last-child {
          border-bottom: 0;
        }

        .wc-order-main strong,
        .wc-order-main span,
        .wc-order-products span,
        .wc-order-total strong,
        .wc-order-total span {
          display: block;
        }

        .wc-order-number {
          color: #d71920 !important;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .1em;
        }

        .wc-order-main strong {
          margin-top: 4px;
          font-size: 12px;
        }

        .wc-order-main > span:last-child,
        .wc-order-products span,
        .wc-order-total span {
          margin-top: 4px;
          color: #8a8a8a;
          font-size: 8px;
        }

        .wc-order-products span {
          line-height: 1.5;
        }

        .wc-order-total strong {
          font-size: 13px;
        }

        .wc-view-order {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #252525;
          background: transparent;
          color: #f5f5f2;
          padding: 9px 10px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .1em;
          cursor: pointer;
        }

        .wc-view-order:hover {
          background: #f5f5f2;
          color: #080808;
        }

        .wc-admin-customer-list {
          border: 1px solid #252525;
          background: #111;
        }

        .wc-admin-customer-row {
          display: grid;
          grid-template-columns: 44px 1.4fr 1fr 1fr 1fr;
          align-items: center;
          gap: 18px;
          padding: 15px 17px;
          border-bottom: 1px solid #252525;
        }

        .wc-admin-customer-row:last-child {
          border-bottom: 0;
        }

        .wc-customer-avatar {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 1px solid #252525;
          background: #080808;
          font-size: 12px;
          font-weight: 700;
        }

        .wc-admin-customer-row strong,
        .wc-admin-customer-row span {
          display: block;
        }

        .wc-admin-customer-row strong {
          font-size: 10px;
        }

        .wc-admin-customer-row span {
          margin-top: 4px;
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .07em;
        }

        .wc-admin-catalog {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .wc-admin-product {
          border: 1px solid #252525;
          background: #111;
        }

        .wc-admin-product-image {
          position: relative;
          aspect-ratio: .78;
          overflow: hidden;
          background: #080808;
        }

        .wc-admin-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .wc-admin-product-image > span {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 6px 8px;
          background: #d71920;
          color: #fff;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .1em;
        }

        .wc-admin-product-info {
          padding: 14px;
        }

        .wc-admin-product-info > span,
        .wc-admin-product-info small {
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .1em;
        }

        .wc-admin-product-info h3 {
          margin: 6px 0;
          font-size: 13px;
        }

        .wc-admin-product-info strong {
          display: block;
          font-size: 14px;
        }

        .wc-admin-product-info small {
          display: block;
          margin-top: 7px;
        }

        .wc-admin-empty,
        .wc-admin-empty-small {
          padding: 50px 20px;
          color: #8a8a8a;
          text-align: center;
          font-size: 10px;
          letter-spacing: .15em;
        }

        .wc-admin-empty-small {
          padding: 25px 0;
        }

        .wc-admin-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 12px;
          color: #8a8a8a;
          font-size: 10px;
          letter-spacing: .16em;
        }

        .wc-spin {
          animation: wcSpin 1s linear infinite;
        }

        @keyframes wcSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .wc-admin-detail-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100001;
          display: flex;
          justify-content: flex-end;
          background: rgba(0,0,0,.72);
        }

        .wc-admin-detail {
          width: min(620px, 100%);
          height: 100%;
          overflow-y: auto;
          padding: 28px;
          border-left: 1px solid #252525;
          background: #0b0b0b;
        }

        .wc-admin-detail-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 1px solid #252525;
        }

        .wc-admin-detail-head span,
        .wc-admin-detail-head h2 {
          display: block;
        }

        .wc-admin-detail-head span {
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .18em;
        }

        .wc-admin-detail-head h2 {
          margin: 6px 0 0;
          font-size: 30px;
        }

        .wc-admin-detail-head button {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 1px solid #252525;
          background: transparent;
          color: #f5f5f2;
          cursor: pointer;
        }

        .wc-admin-customer-box {
          display: grid;
          gap: 1px;
          margin: 18px 0;
          background: #252525;
        }

        .wc-admin-customer-box div {
          padding: 14px;
          background: #111;
        }

        .wc-admin-customer-box span,
        .wc-admin-customer-box strong {
          display: block;
        }

        .wc-admin-customer-box span {
          color: #8a8a8a;
          font-size: 7px;
          letter-spacing: .15em;
        }

        .wc-admin-customer-box strong {
          margin-top: 6px;
          font-size: 11px;
          line-height: 1.5;
        }

        .wc-admin-detail-section {
          margin-top: 20px;
        }

        .wc-admin-detail-title {
          margin-bottom: 10px;
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .18em;
        }

        .wc-admin-detail-items {
          border: 1px solid #252525;
        }

        .wc-admin-detail-item {
          display: grid;
          grid-template-columns: 54px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-bottom: 1px solid #252525;
        }

        .wc-admin-detail-item:last-child {
          border-bottom: 0;
        }

        .wc-admin-detail-item img {
          width: 54px;
          height: 68px;
          object-fit: cover;
          background: #080808;
        }

        .wc-admin-detail-item strong,
        .wc-admin-detail-item span {
          display: block;
        }

        .wc-admin-detail-item strong {
          font-size: 10px;
        }

        .wc-admin-detail-item span {
          margin-top: 5px;
          color: #8a8a8a;
          font-size: 8px;
        }

        .wc-admin-detail-item b {
          font-size: 10px;
        }

        .wc-admin-total-box {
          margin-top: 18px;
          border-top: 1px solid #252525;
        }

        .wc-admin-total-box div {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #252525;
        }

        .wc-admin-total-box span {
          color: #8a8a8a;
          font-size: 8px;
          letter-spacing: .12em;
        }

        .wc-admin-total-box strong {
          font-size: 10px;
        }

        .wc-admin-total-box .total strong {
          font-size: 18px;
        }

        .wc-admin-status-editor {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 18px;
        }

        .wc-admin-status-editor label {
          display: block;
          margin-bottom: 7px;
          color: #8a8a8a;
          font-size: 7px;
          letter-spacing: .15em;
        }

        .wc-admin-status-editor select {
          width: 100%;
          height: 42px;
          border: 1px solid #252525;
          outline: 0;
          background: #111;
          color: #f5f5f2;
          padding: 0 10px;
          font: inherit;
          font-size: 9px;
        }

        .wc-admin-save {
          width: 100%;
          margin-top: 12px;
          height: 46px;
          border: 0;
          background: #f5f5f2;
          color: #080808;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .15em;
          cursor: pointer;
        }

        .wc-admin-save:disabled {
          opacity: .5;
          cursor: wait;
        }

        .wc-admin-order-date {
          margin-top: 14px;
          color: #8a8a8a;
          text-align: center;
          font-size: 8px;
          letter-spacing: .1em;
        }

        @media (max-width: 1050px) {
          .wc-admin-stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .wc-admin-catalog {
            grid-template-columns: repeat(3, 1fr);
          }

          .wc-admin-order-row {
            grid-template-columns: 1fr 1.5fr .7fr auto;
          }

          .wc-order-products {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .wc-admin-sidebar {
            display: none;
          }

          .wc-admin-mobile-head {
            position: sticky;
            top: 0;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 17px;
            border-bottom: 1px solid #252525;
            background: rgba(8,8,8,.96);
          }

          .wc-admin-mobile-head span,
          .wc-admin-mobile-head strong {
            display: block;
          }

          .wc-admin-mobile-head span {
            color: #8a8a8a;
            font-size: 7px;
            letter-spacing: .15em;
          }

          .wc-admin-mobile-head strong {
            margin-top: 4px;
            font-size: 13px;
          }

          .wc-admin-mobile-head button {
            display: grid;
            place-items: center;
            width: 36px;
            height: 36px;
            border: 1px solid #252525;
            background: transparent;
            color: #f5f5f2;
          }

          .wc-admin-content {
            padding: 25px 15px 40px;
          }

          .wc-admin-page-title {
            align-items: flex-start;
            flex-direction: column;
          }

          .wc-admin-stats {
            grid-template-columns: 1fr 1fr;
          }

          .wc-admin-dashboard-grid {
            grid-template-columns: 1fr;
          }

          .wc-admin-catalog {
            grid-template-columns: 1fr 1fr;
          }

          .wc-admin-order-row {
            grid-template-columns: 1fr auto;
            gap: 10px;
          }

          .wc-order-total {
            text-align: right;
          }

          .wc-admin-customer-row {
            grid-template-columns: 40px 1fr;
          }

          .wc-admin-customer-row > div:nth-child(n+3) {
            grid-column: 2;
          }

          .wc-admin-detail {
            width: 100%;
            padding: 18px;
          }
        }

        @media (max-width: 480px) {
          .wc-admin-stats {
            grid-template-columns: 1fr 1fr;
          }

          .wc-admin-stat {
            min-height: 105px;
          }

          .wc-admin-stat strong {
            font-size: 19px;
          }

          .wc-admin-catalog {
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .wc-admin-product-info {
            padding: 10px;
          }

          .wc-admin-product-info h3 {
            font-size: 11px;
          }

          .wc-admin-status-editor {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value
}) {
  return (
    <div className="wc-admin-stat">
      <Icon
        className="wc-admin-stat-icon"
        size={18}
      />

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

export default AdminPanel;