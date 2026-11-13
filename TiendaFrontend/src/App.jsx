
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_URL = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api/v1"}/productos/`;

const formularioInicial = {
    proCodigo: "",
    proNombre: "",
    proPrecio: "",
    proCategoria: ""
};

function App() {

    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [idEdicion, setIdEdicion] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // CONSULTAR PRODUCTOS

    const cargarProductos = useCallback(async () => {

        setCargando(true);
        setError("");

        try {
            const respuesta = await fetch(API_URL);
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.mensaje || "No fue posible consultar los productos.");
            }

            setProductos(datos.Productos || []);

        } catch (err) {
            setError(err.message || "No se pudo conectar con la API.");
        } finally {
            setCargando(false);
        }

    }, []);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);


    // MANEJAR CAMPOS DEL FORMULARIO

    function manejarCambio(e) {

        const { name, value } = e.target;

        setFormulario(anterior => ({
            ...anterior,
            [name]: value
        }));
    }


    // LIMPIAR FORMULARIO

    function limpiarFormulario() {
        setFormulario(formularioInicial);
        setIdEdicion(null);
    }


    // REGISTRAR O ACTUALIZAR PRODUCTO

    async function guardarProducto(e) {

        e.preventDefault();

        setMensaje("");
        setError("");

        const datos = {
            proCodigo: formulario.proCodigo.trim(),
            proNombre: formulario.proNombre.trim(),
            proPrecio: Number(formulario.proPrecio),
            proCategoria: formulario.proCategoria.trim()
        };

        if (
            !datos.proCodigo ||
            !datos.proNombre ||
            !datos.proCategoria ||
            formulario.proPrecio === "" ||
            !Number.isFinite(datos.proPrecio) ||
            datos.proPrecio < 0
        ) {
            setError("Complete todos los campos y verifique el precio.");
            return;
        }

        const editando = idEdicion !== null;

        try {

            const respuesta = await fetch(
                editando ? `${API_URL}${idEdicion}` : API_URL,
                {
                    method: editando ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datos)
                }
            );

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.mensaje || "No fue posible guardar el producto.");
            }

            limpiarFormulario();

            setMensaje(
                editando
                    ? "Producto actualizado correctamente."
                    : "Producto registrado correctamente."
            );

            await cargarProductos();

        } catch (err) {
            setError(err.message || "Error de comunicación con la API.");
        }
    }


    // EDITAR PRODUCTO

    function editarProducto(producto) {

        setIdEdicion(producto.idProducto);

        setFormulario({
            proCodigo: producto.proCodigo,
            proNombre: producto.proNombre,
            proPrecio: producto.proPrecio,
            proCategoria: producto.proCategoria
        });

        setMensaje("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // ELIMINAR PRODUCTO

    async function eliminarProducto(producto) {

        const confirmacion = await Swal.fire({
            title: "¿Eliminar producto?",
            text: "¿Está seguro de eliminar el producto?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "SI",
            cancelButtonText: "NO"
        });

        if (confirmacion.isConfirmed) {

            try {

                const respuesta = await fetch(
                    `${API_URL}${producto.idProducto}`,
                    {
                        method: "DELETE"
                    }
                );

                const resultado = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(resultado.mensaje || "No fue posible eliminar el producto.");
                }

                if (idEdicion === producto.idProducto) {
                    limpiarFormulario();
                }

                setMensaje("Producto eliminado correctamente.");

                await cargarProductos();

                Swal.fire(
                    "Tienda ADSO",
                    "Producto eliminado correctamente.",
                    "success"
                );

            } catch (err) {
                setError(err.message || "Error de comunicación con la API.");
            }
        }
    }


    // INTERFAZ DE USUARIO

    return (

        <main className="container py-4">

            <header className="text-center mb-4">
                <h1 className="fw-bold">Gestión de productos Tienda-Adso</h1>
                <p>API Flask + MySQL + React</p>
            </header>


            {/* FORMULARIO */}

            <section>

                <h2 className="text-center">
                    {idEdicion !== null
                        ? `Editar producto #${idEdicion}`
                        : "Registrar producto"
                    }
                </h2>

                <div className="row justify-content-center">

                    <div className="col-md-6">

                        <form onSubmit={guardarProducto}>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Código
                                </label>

                                <input
                                    type="text"
                                    name="proCodigo"
                                    value={formulario.proCodigo}
                                    onChange={manejarCambio}
                                    maxLength="30"
                                    className="form-control"
                                    required
                                />
                            </div>


                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    name="proNombre"
                                    value={formulario.proNombre}
                                    onChange={manejarCambio}
                                    maxLength="100"
                                    className="form-control"
                                    required
                                />
                            </div>


                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Precio
                                </label>

                                <input
                                    type="number"
                                    name="proPrecio"
                                    min="0"
                                    step="0.01"
                                    value={formulario.proPrecio}
                                    onChange={manejarCambio}
                                    className="form-control"
                                    required
                                />
                            </div>


                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Categoría
                                </label>

                                <input
                                    type="text"
                                    name="proCategoria"
                                    value={formulario.proCategoria}
                                    onChange={manejarCambio}
                                    maxLength="50"
                                    className="form-control"
                                    required
                                />
                            </div>


                            <div className="mt-3">

                                <button
                                    type="submit"
                                    className="btn btn-secondary"
                                >
                                    {idEdicion !== null
                                        ? "Guardar cambios"
                                        : "Registrar producto"
                                    }
                                </button>


                                {idEdicion !== null && (

                                    <button
                                        type="button"
                                        className="btn btn-info ms-2"
                                        onClick={limpiarFormulario}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>


                {mensaje && (
                    <div className="alert alert-success mt-3">
                        {mensaje}
                    </div>
                )}

                {error && (
                    <div className="alert alert-warning mt-3">
                        {error}
                    </div>
                )}

            </section>


            {/* TABLA DE PRODUCTOS */}

            <section className="mt-5">

                <h2 className="fw-bold text-center mb-3">
                    Productos registrados
                </h2>

                <div className="text-end">

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={cargarProductos}
                        disabled={cargando}
                    >
                        {cargando ? "Consultando..." : "Actualizar lista"}
                    </button>

                </div>


                {cargando ? (

                    <p className="text-center mt-3">
                        Cargando productos...
                    </p>

                ) : productos.length === 0 ? (

                    <p className="text-center mt-3">
                        No hay productos registrados.
                    </p>

                ) : (

                    <div className="table-responsive mt-3">

                        <table className="table table-bordered table-striped">

                            <thead className="table-info">

                                <tr className="text-center">
                                    <th>ID</th>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>

                            </thead>


                            <tbody>

                                {productos.map(producto => (

                                    <tr key={producto.idProducto}>

                                        <td>{producto.idProducto}</td>

                                        <td>{producto.proCodigo}</td>

                                        <td>{producto.proNombre}</td>

                                        <td>
                                            {Number(producto.proPrecio).toLocaleString(
                                                "es-CO",
                                                {
                                                    style: "currency",
                                                    currency: "COP",
                                                    maximumFractionDigits: 0
                                                }
                                            )}
                                        </td>

                                        <td>{producto.proCategoria}</td>

                                        <td className="text-center">

                                            <button
                                                type="button"
                                                className="btn btn-info btn-sm me-2"
                                                onClick={() => editarProducto(producto)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => eliminarProducto(producto)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
export default App;

