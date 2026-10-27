import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createRecipe, deleteRecipe, fetchRecipes, updateRecipe } from "../services/recipesService";
import "./Dashboard.css";

const pageSizes = [10, 20, 40, 50];
const emptyRecipe = {
  name: "",
  cuisine: "",
  mealType: ["Lunch"],
  prepTimeMinutes: 0,
  cookTimeMinutes: 0,
  difficulty: "Easy",
};

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

function RecipeForm({ recipe, onClose, onSave, isSaving, error }) {
  const [formData, setFormData] = useState(() => ({
    ...emptyRecipe,
    ...recipe,
    mealType: recipe?.mealType?.join(", ") || emptyRecipe.mealType.join(", "),
  }));

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      ...formData,
      mealType: formData.mealType.split(",").map((item) => item.trim()).filter(Boolean),
      prepTimeMinutes: Number(formData.prepTimeMinutes),
      cookTimeMinutes: Number(formData.cookTimeMinutes),
    });
  }

  return (
    <div className="dashboard__modal-backdrop">
      <section className="dashboard__recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-form-title">
        <div className="dashboard__panel-heading">
          <h2 id="recipe-form-title">{recipe ? "Editar receta" : "Agregar receta"}</h2>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Cerrar formulario">×</button>
        </div>
        <form className="dashboard__recipe-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input name="name" value={formData.name} onChange={updateField} required maxLength="100" />
          </label>
          <label>
            Cocina
            <input name="cuisine" value={formData.cuisine} onChange={updateField} required maxLength="60" />
          </label>
          <label>
            Tipo de comida
            <input name="mealType" value={formData.mealType} onChange={updateField} required placeholder="Lunch, Dinner" />
          </label>
          <div className="dashboard__recipe-form-row">
            <label>
              Preparación (min)
              <input name="prepTimeMinutes" type="number" min="0" value={formData.prepTimeMinutes} onChange={updateField} required />
            </label>
            <label>
              Cocción (min)
              <input name="cookTimeMinutes" type="number" min="0" value={formData.cookTimeMinutes} onChange={updateField} required />
            </label>
          </div>
          <label>
            Dificultad
            <select name="difficulty" value={formData.difficulty} onChange={updateField}>
              <option value="Easy">Fácil</option>
              <option value="Medium">Media</option>
              <option value="Hard">Difícil</option>
            </select>
          </label>
          {error && <p className="dashboard__recipe-form-error" role="alert">{error}</p>}
          <div className="dashboard__recipe-form-actions">
            <button type="button" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button type="submit" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function RecipeConfirmDialog({ confirmation, onCancel, onConfirm, isBusy, error }) {
  const isUpdate = confirmation.type === "update";

  return (
    <div className="dashboard__modal-backdrop">
      <section className="dashboard__confirm-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-confirm-title">
        <span className={`dashboard__confirm-icon${isUpdate ? "" : " dashboard__confirm-icon--delete"}`} aria-hidden="true">
          {isUpdate ? "✎" : "!"}
        </span>
        <h2 id="recipe-confirm-title">{isUpdate ? "Confirmar cambios" : "Eliminar receta"}</h2>
        <p>
          {isUpdate
            ? `¿Deseas guardar los cambios de “${confirmation.recipe.name}”?`
            : `¿Deseas eliminar “${confirmation.recipe.name}”? Esta acción no se puede deshacer.`}
        </p>
        {error && <p className="dashboard__recipe-form-error" role="alert">{error}</p>}
        <div className="dashboard__recipe-form-actions">
          <button type="button" onClick={onCancel} disabled={isBusy}>Cancelar</button>
          <button
            className={isUpdate ? "dashboard__confirm-submit" : "dashboard__confirm-delete"}
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Procesando..." : isUpdate ? "Sí, guardar" : "Sí, eliminar"}
          </button>
        </div>
      </section>
    </div>
  );
}

function RecipeCatalog({ query, onQueryChange, cuisine, onCuisineChange, page, limit, onPageChange, onLimitChange }) {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmationError, setConfirmationError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecipes() {
      setIsLoading(true);
      setError("");

      try {
        const loadedRecipes = await fetchRecipes(controller.signal);
        setRecipes(loadedRecipes);
      } catch (loadError) {
        if (loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Ocurrió un error inesperado.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadRecipes();
    return () => controller.abort();
  }, [retryCount]);

  const cuisines = useMemo(
    () => [...new Set(recipes.map((recipe) => recipe.cuisine))].sort((a, b) => a.localeCompare(b)),
    [recipes],
  );
  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesQuery = recipe.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCuisine = !cuisine || recipe.cuisine === cuisine;
    return matchesQuery && matchesCuisine;
  }), [recipes, query, cuisine]);
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / limit));
  const visibleRecipes = filteredRecipes.slice((page - 1) * limit, page * limit);
  const firstRecord = filteredRecipes.length === 0 ? 0 : (page - 1) * limit + 1;
  const lastRecord = Math.min(page * limit, filteredRecipes.length);

  useEffect(() => {
    if (!isLoading && page > totalPages) onPageChange(totalPages);
  }, [isLoading, page, totalPages, onPageChange]);

  async function handleCreate(recipeData) {
    setIsSaving(true);
    setMutationError("");
    setNotice("");

    try {
      const createdRecipe = await createRecipe(recipeData);
      const localRecipeId = Math.max(0, ...recipes.map((recipe) => recipe.id)) + 1;
      setRecipes((current) => [{ ...createdRecipe, id: localRecipeId, isLocal: true }, ...current]);
      setIsAddingRecipe(false);
      setNotice("Receta agregada correctamente.");
      onPageChange(1);
    } catch (saveError) {
      setMutationError(saveError instanceof Error ? saveError.message : "No se pudo agregar la receta.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleUpdate(recipeData) {
    setConfirmationError("");
    setConfirmation({ type: "update", recipe: editingRecipe, recipeData });
  }

  function handleDelete(recipe) {
    setConfirmationError("");
    setConfirmation({ type: "delete", recipe });
  }

  async function confirmAction() {
    if (!confirmation) return;
    setIsSaving(true);
    setConfirmationError("");
    setNotice("");

    try {
      if (confirmation.type === "update") {
        const { recipe, recipeData } = confirmation;
        const updatedRecipe = recipe.isLocal ? recipeData : await updateRecipe(recipe.id, recipeData);
        setRecipes((current) => current.map((item) => (
          item.id === recipe.id ? { ...item, ...updatedRecipe } : item
        )));
        setEditingRecipe(null);
        setNotice("Receta actualizada correctamente.");
      } else {
        const { recipe } = confirmation;
        setDeletingRecipeId(recipe.id);
        if (!recipe.isLocal) await deleteRecipe(recipe.id);
        setRecipes((current) => current.filter((item) => item.id !== recipe.id));
        setNotice("Receta eliminada correctamente.");
      }
      setConfirmation(null);
    } catch (actionError) {
      setConfirmationError(actionError instanceof Error ? actionError.message : "No se pudo completar la operación.");
    } finally {
      setDeletingRecipeId(null);
      setIsSaving(false);
    }
  }

  return (
    <section className="dashboard__panel dashboard__catalog dashboard__recipe-catalog">
      <div className="dashboard__recipe-toolbar">
        <label className="dashboard__search dashboard__search--recipes">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Buscar receta..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <label className="dashboard__recipe-filter">
          <span>Filtrar por cocina</span>
          <select value={cuisine} onChange={(event) => onCuisineChange(event.target.value)}>
            <option value="">Todas</option>
            {cuisines.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button
          className="dashboard__clear-filters"
          type="button"
          onClick={() => {
            onQueryChange("");
            onCuisineChange("");
          }}
          disabled={!query && !cuisine}
        >
          Limpiar filtros
        </button>
        <button className="dashboard__recipe-add" type="button" onClick={() => {
          setMutationError("");
          setIsAddingRecipe(true);
        }}>
          + Agregar receta
        </button>
      </div>

      {isLoading ? (
        <p className="dashboard__recipe-message" role="status">Cargando recetas...</p>
      ) : error ? (
        <div className="dashboard__recipe-message dashboard__recipe-message--error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Intentar de nuevo</button>
        </div>
      ) : (
        <>
          {notice && <p className="dashboard__recipe-notice" role="status">{notice}</p>}
          {mutationError && !editingRecipe && (
            <p className="dashboard__recipe-form-error" role="alert">{mutationError}</p>
          )}
          <div className="dashboard__recipe-table-wrap">
            <table className="dashboard__recipe-table">
              <thead>
                <tr>
                  <th scope="col">ID RECETA</th>
                  <th scope="col">COCINA</th>
                  <th scope="col">NOMBRE</th>
                  <th scope="col">TIPO</th>
                  <th scope="col">PREPARACIÓN</th>
                  <th scope="col">DIFICULTAD</th>
                  <th scope="col">OPCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td className="dashboard__recipe-id">#{recipe.id}</td>
                    <td>
                      <span className="dashboard__recipe-cuisine">{recipe.cuisine}</span>
                    </td>
                    <td className="dashboard__recipe-name">{recipe.name}</td>
                    <td>
                      <span className="dashboard__recipe-type">
                        <span aria-hidden="true">{recipe.mealType[0]?.charAt(0)}</span>
                        {recipe.mealType.join(", ")}
                      </span>
                    </td>
                    <td>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</td>
                    <td>
                      <span className={`dashboard__recipe-difficulty dashboard__recipe-difficulty--${recipe.difficulty.toLowerCase()}`}>
                        <span aria-hidden="true">●</span> {recipe.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard__recipe-actions">
                        <button type="button" onClick={() => {
                          setNotice("");
                          setMutationError("");
                          setEditingRecipe(recipe);
                        }}>
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={deletingRecipeId !== null}
                          onClick={() => handleDelete(recipe)}
                        >
                          {deletingRecipeId === recipe.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecipes.length === 0 && (
                  <tr>
                    <td className="dashboard__recipe-empty" colSpan="7">No encontramos recetas con esos filtros.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="dashboard__pagination">
            <label>
              <span>Registros por página</span>
              <select value={limit} onChange={(event) => onLimitChange(Number(event.target.value))}>
                {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <span className="dashboard__pagination-summary">
              Mostrando {firstRecord}–{lastRecord} de {filteredRecipes.length} recetas
            </span>
            <div className="dashboard__pagination-controls" aria-label="Paginación">
              <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  aria-label={`Página ${pageNumber}`}
                  aria-current={pageNumber === page ? "page" : undefined}
                  className={pageNumber === page ? "is-active" : ""}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button type="button" aria-label="Página siguiente" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                ›
              </button>
            </div>
          </div>
        </>
      )}
      {(isAddingRecipe || editingRecipe) && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={() => {
            if (isSaving) return;
            setIsAddingRecipe(false);
            setEditingRecipe(null);
            setMutationError("");
          }}
          onSave={editingRecipe ? handleUpdate : handleCreate}
          isSaving={isSaving}
          error={mutationError}
        />
      )}
      {confirmation && (
        <RecipeConfirmDialog
          confirmation={confirmation}
          onCancel={() => {
            if (isSaving) return;
            setConfirmation(null);
            setConfirmationError("");
          }}
          onConfirm={confirmAction}
          isBusy={isSaving}
          error={confirmationError}
        />
      )}
    </section>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("inicio");
  const [productQuery, setProductQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedLimit = Number(searchParams.get("limit"));
  const limit = pageSizes.includes(requestedLimit) ? requestedLimit : 10;
  const menuQuery = searchParams.get("q") || "";
  const cuisine = searchParams.get("cuisine") || "";
  const fullName = `${user.firstName} ${user.lastName}`;
  const activeLabel = sections.find((section) => section.id === activeSection).label;

  useEffect(() => {
    if (searchParams.get("page") === String(page) && searchParams.get("limit") === String(limit)) return;
    const normalizedParams = new URLSearchParams(searchParams);
    normalizedParams.set("page", String(page));
    normalizedParams.set("limit", String(limit));
    setSearchParams(normalizedParams, { replace: true });
  }, [searchParams, page, limit, setSearchParams]);

  function updateMenuParams(updates, { resetPage = false, replace = false } = {}) {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, String(value));
      else nextParams.delete(key);
    });
    if (resetPage) nextParams.set("page", "1");
    setSearchParams(nextParams, { replace });
  }

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
            {activeSection !== "menu" && (
              <label className="dashboard__search dashboard__search--top">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Buscar en el sistema"
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                />
              </label>
            )}
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
                    : "Consulta las recetas disponibles, busca por nombre y filtra por cocina."}
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
                {activeSection === "menu" ? (
                  <RecipeCatalog
                    query={menuQuery}
                    onQueryChange={(value) => updateMenuParams({ q: value }, { resetPage: true, replace: true })}
                    cuisine={cuisine}
                    onCuisineChange={(value) => updateMenuParams({ cuisine: value }, { resetPage: true })}
                    page={page}
                    limit={limit}
                    onPageChange={(value) => updateMenuParams({ page: value })}
                    onLimitChange={(value) => updateMenuParams({ limit: value, page: 1 })}
                  />
                ) : (
                  <ProductCatalog query={productQuery} onQueryChange={setProductQuery} />
                )}
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
