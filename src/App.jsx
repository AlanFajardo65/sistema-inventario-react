import { useMemo, useState } from "react";

const initialProducts = [
  { id: 1, name: "Cuaderno profesional", category: "Papelería", price: 42.5, quantity: 18 },
  { id: 2, name: "Pluma azul", category: "Papelería", price: 8, quantity: 6 },
  { id: 3, name: "Memoria USB 32 GB", category: "Tecnología", price: 115, quantity: 3 },
];

const money = (value) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

const emptyForm = { name: "", category: "", price: "", quantity: "" };

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const lowStockLimit = 5;

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(term)
    );
  }, [products, search]);

  const lowStock = products.filter((product) => product.quantity <= lowStockLimit).length;
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
  const inventoryValue = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!form.name.trim() || !form.category.trim() || form.price === "" || form.quantity === "") {
      setMessage("Completa todos los campos antes de guardar.");
      return;
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      setMessage("El precio debe ser positivo y la cantidad un número entero igual o mayor que cero.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      category: form.category.trim(),
      price,
      quantity,
    };

    if (editingId !== null) {
      setProducts(products.map((product) =>
        product.id === editingId ? { ...product, ...productData } : product
      ));
      setMessage("Producto actualizado correctamente.");
    } else {
      setProducts([...products, { id: Date.now(), ...productData }]);
      setMessage("Producto agregado correctamente.");
    }

    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteProduct(id) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmed) return;
    setProducts(products.filter((product) => product.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    setMessage("Producto eliminado.");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">SI</div>
        <div>
          <p className="eyebrow">CONTROL DE EXISTENCIAS</p>
          <h1>Sistema de inventario</h1>
        </div>
        <span className="status-pill">Prototipo React</span>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">PANEL GENERAL</p>
          <h2>Resumen del inventario</h2>
          <p className="muted">Administra productos, precios y cantidades desde un solo lugar.</p>
        </div>
      </section>

      <section className="stats-grid" aria-label="Resumen">
        <article className="stat-card">
          <span className="stat-icon">▦</span>
          <p>Productos registrados</p>
          <strong>{products.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon">▤</span>
          <p>Unidades disponibles</p>
          <strong>{totalUnits}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon warning-icon">!</span>
          <p>Existencias bajas</p>
          <strong>{lowStock}</strong>
          <small>Umbral: {lowStockLimit} unidades o menos</small>
        </article>
        <article className="stat-card">
          <span className="stat-icon">＄</span>
          <p>Valor del inventario</p>
          <strong className="money-stat">{money(inventoryValue)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId !== null ? "EDICIÓN" : "NUEVO REGISTRO"}</p>
              <h2>{editingId !== null ? "Editar producto" : "Agregar producto"}</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre del producto
              <input name="name" value={form.name} onChange={updateField} placeholder="Ej. Teclado inalámbrico" />
            </label>
            <label>
              Categoría
              <input name="category" value={form.category} onChange={updateField} placeholder="Ej. Tecnología" />
            </label>
            <div className="form-row">
              <label>
                Precio (MXN)
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} placeholder="0.00" />
              </label>
              <label>
                Cantidad
                <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={updateField} placeholder="0" />
              </label>
            </div>
            <button className="primary-button" type="submit">
              {editingId !== null ? "Guardar cambios" : "+ Agregar producto"}
            </button>
            {editingId !== null && (
              <button className="secondary-button" type="button" onClick={cancelEdit}>Cancelar edición</button>
            )}
            {message && <p className="message" role="status">{message}</p>}
          </form>
        </article>

        <article className="panel table-panel">
          <div className="table-heading">
            <div>
              <p className="eyebrow">REGISTRO DE ARTÍCULOS</p>
              <h2>Productos</h2>
            </div>
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              aria-label="Buscar producto o categoría"
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Existencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLow = product.quantity <= lowStockLimit;
                  return (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <span className="category">{product.category}</span>
                      </td>
                      <td>{money(product.price)}</td>
                      <td>{product.quantity}</td>
                      <td><span className={`stock-badge ${isLow ? "low" : "good"}`}>{isLow ? "Stock bajo" : "Disponible"}</span></td>
                      <td>
                        <div className="actions">
                          <button className="text-button" onClick={() => startEdit(product)} type="button">Editar</button>
                          <button className="text-button delete-button" onClick={() => deleteProduct(product.id)} type="button">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr><td className="empty-state" colSpan="5">No se encontraron productos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="table-note">Los datos de este prototipo se mantienen en memoria mientras la página está abierta. Aún no hay base de datos conectada.</p>
        </article>
      </section>
      <footer>Proyecto académico · Sistema de inventario web · React</footer>
    </main>
  );
}