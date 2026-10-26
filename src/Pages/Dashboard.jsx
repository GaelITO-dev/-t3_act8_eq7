import { useState } from "react";
import "./Dashboard.css";

const sections = [
  { id: "inicio", label: "Inicio", icon: "⌂" },
  { id: "pedidos", label: "Pedidos", icon: "▤" },
  { id: "menu", label: "Menú", icon: "♧" },
];

const products = [
  { name: "Pizza de pepperoni", detail: "Chica · 6 rebanadas", code: "#2001", price: "$200.00", status: "Disponible" },
  { name: "Pizza de queso", detail: "Chica · 6 rebanadas", code: "#2002", price: "$200.00", status: "Disponible" },
  { name: "Rebanada en mostrador", detail: "Individual · 1 pieza", code: "#1000", price: "$35.00", status: "Agotado" },
  { name: "Pizza carbonara", detail: "Grande · 12 rebanadas", code: "#2003", price: "$350.00", status: "Próximamente" },
  { name: "Pizza de carnes frías", detail: "Chica · 6 rebanadas", code: "#2003", price: "$200.00", status: "Descontinuado" },
  { name: "Pizza New York Style", detail: "Individual · 1 pieza", code: "#2081", price: "$155.00", status: "Próximamente" },
];

const proposals = [
  { initials: "GM", name: "GaelGod777", title: "Oaxaqueña especial", date: "20/10/2025", message: "Les propongo una pizza que lleve quesillo, jamón, peperoni, aguacate y champiñones." },
  { initials: "OE", name: "Oliver Enriquez", title: "Pizza Taquera", date: "12/10/2025", message: "Que les parece una que lleve mitad pastor y mitad queso con carnitas." },
  { initials: "JG", name: "Jony Gadiel", title: "Pizza hawaiana", date: "5/10/2025", message: "Me gustaría que consideraran hacer una que lleve salsa verde en vez de salsa roja." },
];

function ProductCatalog({ query, onQueryChange }) {
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", "Más vendidos", "Promociones", "Próximamente", "Paquetes"];
  const visibleProducts = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.code}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category !== "Próximamente" || product.status === "Próximamente";
    return matchesQuery && matchesCategory;
  });

  return (
    <section className="dashboard__panel dashboard__catalog">
      <div className="dashboard__panel-heading">
        <h2>Productos del menú</h2>
        <span>6 productos</span>
      </div>
      <label className="dashboard__search dashboard__search--products">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Buscar por nombre o código del producto"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <div className="dashboard__catalog-toolbar">
        <div className="dashboard__filters" aria-label="Filtrar productos">
          {categories.map((item) => (
            <button
              className={`dashboard__filter${category === item ? " is-active" : ""}`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="dashboard__products">
        {visibleProducts.map((product) => (
          <article className="dashboard__product" key={product.name}>
            <div className="dashboard__product-image" aria-hidden="true">🍕</div>
            <h3>{product.name}</h3>
            <p>{product.detail}</p>
            <span className="dashboard__product-code">{product.code}</span>
            <div className="dashboard__product-footer">
              <strong>{product.price}</strong>
              <span className={`dashboard__status dashboard__status--${product.status.toLowerCase().replace(" ", "-")}`}>
                <span aria-hidden="true">●</span> {product.status}
              </span>
            </div>
          </article>
        ))}
        {visibleProducts.length === 0 && (
          <p className="dashboard__empty-results">No encontramos productos con esa búsqueda.</p>
        )}
      </div>
      <p className="dashboard__catalog-note"><span aria-hidden="true">ⓘ</span> Los productos no disponibles no se pueden agregar al pedido.</p>
    </section>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("inicio");
  const [productQuery, setProductQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fullName = `${user.firstName} ${user.lastName}`;
  const activeLabel = sections.find((section) => section.id === activeSection).label;

  return (
    <div className={`dashboard${isSidebarOpen ? "" : " dashboard--sidebar-closed"}`}>
      <aside
        className="dashboard__sidebar"
        id="dashboard-sidebar"
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
      >
        <a className="dashboard__brand" href="#" onClick={(event) => event.preventDefault()}>
          <span>Picsas</span>
          <small>ADMINISTRACIÓN</small>
        </a>

        <p className="dashboard__menu-label">GENERAL</p>
        <nav className="dashboard__nav" aria-label="Navegación principal">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              title={section.label}
              aria-label={section.label}
              className={`dashboard__nav-link${activeSection === section.id ? " is-active" : ""}`}
              onClick={() => setActiveSection(section.id)}
              aria-current={activeSection === section.id ? "page" : undefined}
            >
              <span className="dashboard__nav-icon" aria-hidden="true">{section.icon}</span>
              <span className="dashboard__nav-label">{section.label}</span>
              {section.id === "pedidos" && <span className="dashboard__order-count">3</span>}
            </button>
          ))}
        </nav>

        <button className="dashboard__logout" type="button" onClick={onLogout}>
          <span aria-hidden="true">↪</span>
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <div className="dashboard__main">
        <header className="dashboard__navbar">
          <button
            className="dashboard__sidebar-toggle"
            type="button"
            aria-label={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            aria-expanded={isSidebarOpen}
            aria-controls="dashboard-sidebar"
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div className="dashboard__breadcrumb">
            <span>Pizza</span><span aria-hidden="true">/</span><span>{activeLabel}</span>
            {activeSection === "inicio" && <><span aria-hidden="true">/</span><strong>Nuevo pedido</strong></>}
          </div>
          <div className="dashboard__account">
            <label className="dashboard__search dashboard__search--top">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Buscar en el sistema"
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
              />
            </label>
            <span className="dashboard__notification" aria-label="Notificaciones">♧<i /></span>
            <img className="dashboard__avatar" src={user.image} alt={`Foto de ${fullName}`} />
            <div className="dashboard__user-copy">
              <span className="dashboard__username">{fullName}</span>
              <small>Administrador</small>
            </div>
          </div>
        </header>

        <main className="dashboard__content">
          <div className="dashboard__page-heading">
            <div>
              <h1>{activeSection === "inicio" ? "Inicio" : activeLabel}</h1>
              <p>
                {activeSection === "inicio"
                  ? "Selecciona los productos y completa los datos para enviar el pedido a cocina."
                  : activeSection === "pedidos"
                    ? "Consulta el estado de tus pedidos recientes."
                    : "Explora los productos disponibles en nuestro menú."}
              </p>
            </div>
            {activeSection === "inicio" && (
              <button className="dashboard__back-link" type="button" onClick={() => setActiveSection("pedidos")}>
                <span aria-hidden="true">←</span> Volver a pedidos
              </button>
            )}
          </div>

          {activeSection === "pedidos" ? (
            <section className="dashboard__panel dashboard__orders">
              <span className="dashboard__orders-icon" aria-hidden="true">▤</span>
              <h2>Tus pedidos</h2>
              <p>Aquí aparecerán tus pedidos y su estado.</p>
              <button type="button" onClick={() => setActiveSection("inicio")}>Crear un pedido</button>
            </section>
          ) : (
            <div className={`dashboard__workspace${activeSection === "menu" ? " dashboard__workspace--menu" : ""}`}>
              <div className="dashboard__workspace-main">
                <ProductCatalog query={productQuery} onQueryChange={setProductQuery} />
                {activeSection === "inicio" && (
                  <section className="dashboard__panel dashboard__feedback">
                    <div className="dashboard__panel-heading">
                      <h2>COMENTARIOS, QUEJAS Y SUGERENCIAS</h2>
                      <button type="button">Buscar cliente existente</button>
                    </div>
                    <div className="dashboard__order-type">
                      <button className="is-selected" type="button">♜ &nbsp; En restaurante</button>
                      <button type="button">♧ &nbsp; A domicilio</button>
                    </div>
                    <label>Nombre del cliente<input value={`${user.firstName} ${user.lastName}`} readOnly /></label>
                    <label>Comentario<textarea defaultValue="La pizza llegó mordida :/" rows="1" /></label>
                  </section>
                )}
              </div>

              {activeSection === "inicio" && (
                <aside className="dashboard__panel dashboard__proposals">
                  <div className="dashboard__panel-heading">
                    <h2>Propuestas de Pizza</h2>
                    <button type="button">Editar</button>
                  </div>
                  <p className="dashboard__proposal-intro">
                    ¡HAREMOS LA PIZZA DEL COMENTARIO MÁS VOTADO DE LA SEMANA!
                    <br />(disponible en rebanadas solo en mostrador)
                  </p>
                  <p className="dashboard__comment-count">5 Comentarios</p>
                  <div className="dashboard__proposal-list">
                    {proposals.map((proposal) => (
                      <article className="dashboard__proposal" key={proposal.name}>
                        <span className="dashboard__proposal-avatar">{proposal.initials}</span>
                        <div className="dashboard__proposal-copy">
                          <div className="dashboard__proposal-meta">
                            <strong>{proposal.name}</strong><time>{proposal.date}</time>
                          </div>
                          <strong className="dashboard__proposal-title">{proposal.title}</strong>
                          <p>{proposal.message}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                  <form className="dashboard__proposal-form" onSubmit={(event) => event.preventDefault()}>
                    <input aria-label="Escribe tu propuesta" placeholder="Escribe tu propuesta" />
                    <button type="submit">Enviar</button>
                  </form>
                </aside>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
