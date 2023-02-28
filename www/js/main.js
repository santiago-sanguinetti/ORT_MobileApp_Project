// import { Geolocation } from "@capacitor/geolocation";
// import { Share } from "../../node_modules/@capacitor/share";
// no lo pude hacer funcionar, probé cambiar el path para que coincida, probé poner
// capacitor.js como módulo, intenté reinstalar todo desde 0 varias veces y nada

// Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.

const baseUrl = "https://dwallet.develotion.com/";
let token = "";
let id = 0;
let rubros = [];

const $ = {};
iniciarApp();
function iniciarApp() {
    guardarElementos();
    agregarEventos();
    getDepartamentos();
    manejarDatosAPI();
}

function guardarElementos() {
    $.ionRouter = document.querySelector("ion-router");

    $.formRegistro = document.querySelector("#formRegistroUsuario");
    $.slcDepartamentos = document.querySelector("#departamento");
    $.formLogin = document.querySelector("#formLoginUsuario");
    $.formGasto = document.querySelector("#formGastosUsuario");
    $.formIngreso = document.querySelector("#formIngresosUsuario");
    $.filtroMovimientos = document.querySelector("#filtroMovimientos");

    $.btnLogout = document.querySelector("#logout-btn");
}

function agregarEventos() {
    $.ionRouter.addEventListener("ionRouteDidChange", manejarRuta);

    $.formRegistro.addEventListener("submit", manejarRegistroUsuario);
    $.slcDepartamentos.addEventListener("ionChange", getCiudades);
    $.formLogin.addEventListener("submit", manejarLoginUsuario);
    $.formGasto.addEventListener("submit", manejarGastosUsuario);
    $.formIngreso.addEventListener("submit", manejarIngresosUsuario);
    $.filtroMovimientos.addEventListener(
        "ionChange",
        obtenerMovimientosUsuario
    );

    $.btnLogout.addEventListener("click", logoutUsuario);
}

function obtenerDatosRegistro() {
    return {
        usuario: $.formRegistro.querySelector("#usuario").value,
        password: $.formRegistro.querySelector("#password").value,
        idDepartamento: $.formRegistro.querySelector("#departamento").value,
        idCiudad: $.formRegistro.querySelector("#ciudad").value,
    };
}

function manejarLoginUsuario(event) {
    event.preventDefault();

    const datos = obtenerDatosLogin();
    if (datos.usuario != "" && datos.password != "") {
        loginUsuario(datos);
    } else {
        mostrarToastError("Por favor, complete los campos");
    }
}

function manejarRegistroUsuario(event) {
    event.preventDefault();

    const datos = obtenerDatosRegistro();
    registrarUsuario(datos);
}

function manejarGastosUsuario(event) {
    event.preventDefault();

    const datos = obtenerDatosMovimiento("gasto");
    if (datos.total > 0) {
        ingresarMovimiento(datos);
    } else if (datos.total <= 0) {
        mostrarToastError("El monto debe ser positivo");
    }
}

function obtenerDatosMovimiento(tipo) {
    let formMovimiento = $.formGasto;

    if (tipo === "ingreso") {
        formMovimiento = $.formIngreso;
    }
    if (
        formMovimiento.querySelector("#fecha").value != undefined &&
        formMovimiento.querySelector("#monto").value != ""
    ) {
        return {
            idUsuario: id,
            concepto: formMovimiento.querySelector("#concepto").value,
            categoria: formMovimiento.querySelector(`#rubro${tipo}`).value,
            total: parseInt(formMovimiento.querySelector("#monto").value),
            medio: formMovimiento.querySelector("#medioPago").value,
            fecha: formMovimiento.querySelector("#fecha").value.slice(0, 10),
        };
    } else {
        mostrarToastError("Por favor, complete los campos");
        return {};
    }
}

function ingresarMovimiento(datos) {
    const headers = {
        "Content-Type": "application/json",
        apiKey: token,
    };
    const body = {
        idUsuario: datos.idUsuario,
        concepto: datos.concepto,
        categoria: datos.categoria,
        total: datos.total,
        medio: datos.medio,
        fecha: datos.fecha,
    };

    fetch(`${baseUrl}/movimientos.php`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            mostrarToastSuccess(jsonResponse.mensaje);
            obtenerMovimientosUsuario();
        })
        .catch(mostrarError);
}

function manejarIngresosUsuario(event) {
    event.preventDefault();

    const datos = obtenerDatosMovimiento("ingreso");
    if (datos.total > 0) {
        ingresarMovimiento(datos);
    } else if (datos.total <= 0) {
        mostrarToastError("El monto debe ser positivo");
    }
}

function obtenerDatosLogin() {
    return {
        usuario: $.formLogin.querySelector("#usuario").value,
        password: $.formLogin.querySelector("#password").value,
    };
}

function manejarRuta(event) {
    const path = event.detail.to;

    const sesionValida = validarSesion(path);

    if (sesionValida) {
        ocultarPageActiva();

        switch (path) {
            case "/login":
                mostrarPageActiva("#page-login");
                break;
            case "/registro":
                mostrarPageActiva("#page-registro");
                break;
            case "/gastos":
                mostrarPageActiva("#page-gastos");

                break;
            case "/ingresos":
                mostrarPageActiva("#page-ingresos");

                break;
            case "/movimientos":
                mostrarPageActiva("#page-movimientos");

                break;
            case "/cajeros":
                mostrarPageActiva("#page-cajeros");
                break;
        }
    }
}
function manejarDatosAPI() {
    apiKey = token;
    if (apiKey != "") {
        obtenerMovimientosUsuario();
        getRubros(token, "ingreso");
        getRubros(token, "gasto");
        getCajeros();
    } else {
        token = getSesionUsuario();
        id = getIdUsuario();
        guardarSesionUsuario(token, id);
        if (token != "") {
            manejarDatosAPI();
        }
    }
}

function validarSesion(path) {
    if (path !== "/login" && path !== "/registro") {
        if (token === "") {
            navegar("/login");
            // mostrarToastError(
            //     "Debe haber ingresado para realizar esta acción."
            // );
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

function navegar(path) {
    $.ionRouter.push(path);
}

function ocultarPageActiva() {
    const $pageActive = document.querySelector(".page-activa");

    if ($pageActive) {
        $pageActive.classList.remove("page-activa");
    }
}

function mostrarPageActiva(id) {
    document.querySelector(id).classList.add("page-activa");
}

function registrarUsuario(datos) {
    const headers = {
        "Content-Type": "application/json",
    };
    const body = {
        usuario: datos.usuario,
        password: datos.password,
        idDepartamento: datos.idDepartamento,
        idCiudad: datos.idCiudad,
    };

    fetch(`${baseUrl}/usuarios.php`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            if (jsonResponse.mensaje) {
                // Si entra al if es porque la api devolvió un evento con mensaje de error
                mostrarToastError(jsonResponse.mensaje);
            } else {
                mostrarToastSuccess("Usuario creado con éxito");
                navegar("/login");
            }
        })
        .catch(mostrarError);
}

function loginUsuario(datos) {
    const headers = {
        "Content-Type": "application/json",
    };
    const body = {
        usuario: datos.usuario,
        password: datos.password,
    };

    fetch(`${baseUrl}/login.php`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            guardarSesionUsuario(jsonResponse.apiKey, jsonResponse.id);
            iniciarApp();
            navegar("/movimientos");
        })
        .catch(mostrarError);
}

function logoutUsuario() {
    if (token) {
        token = "";
        id = -1;
        borrarLocalStorage();
        mostrarToast("Se ha cerrado la sesión correctamente");
        navegar("/login");
    }
}

function getDepartamentos() {
    const headers = {
        "Content-Type": "application/json",
    };

    fetch(`${baseUrl}/departamentos.php`, {
        method: "GET",
        headers: headers,
    })
        .then(getJsonBody)
        .then((jsonResponse) => {
            escribirDepartamentos(jsonResponse.departamentos);
        })
        .catch(mostrarError);
}

function escribirDepartamentos(departamentos) {
    const fragment = document.createDocumentFragment();
    const select = document.querySelector("#departamento");
    departamentos.map((depto) => {
        let opt = document.createElement("ion-select-option");
        opt.value = depto.id;
        opt.textContent = depto.nombre;
        fragment.appendChild(opt);
    });

    select.appendChild(fragment);
}

function getCiudades() {
    const headers = {
        "Content-Type": "application/json",
    };
    let idDepto = document.querySelector("#departamento").value;

    fetch(`${baseUrl}/ciudades.php?idDepartamento=${idDepto}`, {
        method: "GET",
        headers: headers,
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            escribirCiudades(jsonResponse, idDepto);
        })
        .catch(mostrarError);
}

function escribirCiudades(data, idDepto) {
    let optCiudades = "";
    data.ciudades.forEach((ciudad) => {
        if (ciudad.idDepartamento == idDepto) {
            optCiudades += `<ion-select-option value="${ciudad.id}">${ciudad.nombre}</ion-select-option>`;
        }
    });
    ciudad.innerHTML = optCiudades;
}

function getRubros(apiKey, tipo) {
    const headers = {
        "Content-Type": "application/json",
        apiKey: apiKey,
    };

    fetch(`${baseUrl}/rubros.php`, {
        method: "GET",
        headers: headers,
    })
        .then(getJsonBody)
        .then((jsonResponse) => {
            escribirRubros(jsonResponse.rubros, tipo);
            rubros = jsonResponse.rubros;
        })
        .catch(mostrarError);
}

function escribirRubros(rubros, tipo) {
    const fragment = document.createDocumentFragment();
    const select = document.querySelector(`#rubro${tipo}`);

    if (select.childNodes.length < 6) {
        rubros.map((rubro) => {
            if (rubro.tipo == tipo) {
                let opt = document.createElement("ion-select-option");
                opt.value = rubro.id;
                opt.textContent = rubro.nombre;
                fragment.appendChild(opt);
            }
        });

        select.appendChild(fragment);
    }
}

function mostrarError(error) {
    //se podría mostrar un mensaje en algún lado también
    console.warn(error);
    mostrarToastError(error.mensaje);
}

function getJsonBody(response) {
    return response.json();
}

function guardarSesionUsuario(apiKey, idUsuario) {
    token = apiKey;
    id = idUsuario;
    guardarLocalStorage("tokenUsuario", token);
    guardarLocalStorage("idUsuario", id);
}

function guardarLocalStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}
function borrarLocalStorage() {
    localStorage.clear();
}

function getSesionUsuario() {
    return leerLocalStorage("tokenUsuario", "");
}
function getIdUsuario() {
    return leerLocalStorage("idUsuario", 0);
}

function leerLocalStorage(clave, valorPorDefecto) {
    const valorStorage = JSON.parse(localStorage.getItem(clave));

    if (valorStorage === null) {
        return valorPorDefecto;
    } else {
        return valorStorage;
    }
}

function obtenerMovimientosUsuario() {
    const headers = {
        "Content-Type": "application/json",
        apiKey: token,
    };

    fetch(`${baseUrl}/movimientos.php?idUsuario=${id}`, {
        method: "GET",
        headers: headers,
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            escribirMovimientos(jsonResponse.movimientos);
            escribirSaldos(jsonResponse.movimientos);
        })
        .catch(mostrarError);
}

function ordenarPorFecha(array) {
    array.sort(function (a, b) {
        if (a.fecha > b.fecha) {
            return 1;
        }
        if (a.fecha < b.fecha) {
            return -1;
        }
        return 0;
    });
}
function escribirSaldos(movimientos) {
    const saldo = document.querySelector("#saldo");
    const gastos = document.querySelector("#movGastos");
    const ingresos = document.querySelector("#movIngresos");
    let totalGastos = 0;
    let totalIngresos = 0;
    movimientos.forEach((movimiento) => {
        if (movimiento.categoria <= 6) {
            totalGastos += movimiento.total;
        } else if (movimiento.categoria >= 6) {
            totalIngresos += movimiento.total;
        }
    });
    saldo.innerHTML = `Saldo: ${totalIngresos - totalGastos}`;
    gastos.innerHTML = `Gastos: ${totalGastos}`;
    ingresos.innerHTML = `Ingresos: ${totalIngresos}`;
}

function rubrosPorCategoria(rubros, movimientos) {
    const categorias = {};

    for (const obj of rubros) {
        categorias[obj.id] = obj;
    }

    for (const obj of movimientos) {
        const categoria = obj.categoria;
        const categoriaObj = categorias[categoria];
        const nombre = categoriaObj;

        return nombre;
    }
}

function escribirMovimientos(data) {
    let movimientos = filtrarMovimientos(data, obtenerFiltro());
    const cardContainer = document.querySelector("#cardMovimientosContainer");
    cardContainer.innerHTML = "";

    movimientos.forEach((movimiento) => {
        let claseCardMovimiento = "";
        let icono = "";
        let nombreRubro = "";
        let tipo = "";
        rubros.forEach((rubro) => {
            if (rubro.id == movimiento.categoria) {
                nombreRubro = rubro.nombre;
                tipo = rubro.tipo;
            }
        });

        if (movimiento.categoria <= 6) {
            claseCardMovimiento = "cardGasto";
            icono = `<ion-icon name="trending-down-outline"></ion-icon>`;
        } else if (movimiento.categoria > 6) {
            claseCardMovimiento = "cardIngreso";
            icono = `<ion-icon name="trending-up-outline"></ion-icon>`;
        }

        const cardHTML = `
        
        <ion-card class="${claseCardMovimiento}">
            <ion-card-header>
                <ion-card-title>${icono} ${movimiento.concepto} </ion-icon></ion-card-title>
                <ion-card-subtitle>Fecha: ${movimiento.fecha}</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
            <p>Tipo: ${tipo} </p>
            <p>Rubro: ${nombreRubro} </p>
            <p>Monto: ${movimiento.total} </p>
            <p>Medio de pago: ${movimiento.medio}</p>
        
            </ion-card-content>

            <ion-button fill="clear" color="danger" onclick="eliminarMovimiento(${movimiento.id})">Eliminar</ion-button>
        </ion-card>
        `;
        cardContainer.innerHTML += cardHTML;
    });
}

function filtrarMovimientos(movimientos, tipo = "default") {
    if (tipo === "gasto") {
        return movimientos.filter((movimiento) => movimiento.categoria <= 6);
    } else if (tipo === "ingreso") {
        return movimientos.filter((movimiento) => movimiento.categoria >= 6);
    }
    return movimientos;
}

function obtenerFiltro() {
    return document.querySelector("#filtroMovimientos").value;
}

//Deja de funcionar al poner el js como module
function eliminarMovimiento(idMovimiento) {
    const headers = {
        "Content-Type": "application/json",
        apiKey: token,
    };
    const body = {
        idMovimiento: idMovimiento,
    };

    fetch(`${baseUrl}/movimientos.php`, {
        method: "DELETE",
        headers: headers,
        body: JSON.stringify(body),
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            obtenerMovimientosUsuario();
        })
        .catch(mostrarError);
}

function crearMapa(cajeros) {
    mapContainer = document.querySelector("#map");

    // Si no tiene elementos hijos se crea el mapa
    if (!mapContainer.hasChildNodes()) {
        var map = L.map("map").setView([-34.901, -56.164], 13);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        cajeros.forEach((cajero) => {
            // Si quisiera cambiar el mensaje
            let negativo = "No";
            let positivo = "Sí";

            let disponibilidadPesos = negativo;
            let disponibilidadDolares = negativo;
            let recibeDepositos = negativo;
            let estaAbierto = negativo;

            if (cajero.tienePesos) {
                disponibilidadPesos = positivo;
            } else if (cajero.tieneDolares) {
                disponibilidadDolares = positivo;
            } else if (cajero.depositos) {
                recibeDepositos = positivo;
            } else if (cajero.disponible) {
                estaAbierto = positivo;
            }

            if (cajero.latitud != 0 && cajero.longitud != 0) {
                let marker = L.marker([cajero.latitud, cajero.longitud]).addTo(
                    map
                );
                marker
                    .bindPopup(
                        `<b>Nro. Cajero: ${cajero.idCajero}</b>
                        <br>Abierto: ${estaAbierto}
                        <br>
                        <br>Dispone de pesos: ${disponibilidadPesos}
                        <br>Dispone de dólares: ${disponibilidadDolares}
                        <br>
                        <br>Recibe depósitos: ${recibeDepositos}`
                    )
                    .openPopup();
            }
        });
    }
}

function getCajeros() {
    const headers = {
        "Content-Type": "application/json",
    };

    fetch(`${baseUrl}/cajeros.php`, {
        method: "GET",
        headers: headers,
    })
        .then(getJsonBody)
        .then((jsonResponse) => {
            crearMapa(jsonResponse.cajeros);
        })
        .catch(mostrarError);
}

function mostrarToast(mensaje, color) {
    const $toast = document.createElement("ion-toast");
    $toast.message = mensaje;
    $toast.duration = 2000;
    $toast.color = color;
    $toast.position = "bottom";

    document.body.appendChild($toast);
    $toast.present();
}

function mostrarToastSuccess(mensaje) {
    mostrarToast(mensaje, "success");
}

function mostrarToastError(mensaje) {
    mostrarToast(mensaje, "danger");
}

// ↓ Estas funciones no se utilizan porque no pude hacer funcionar el plugin de capacitor ↓
// Obtener ubicación del usuario
async function obtenerUbicacionUsuario() {
    navigator.geolocation.getCurrentPosition(
        successGeolocation,
        errorGeolocation
    );

    const coordinates = await Geolocation.getCurrentPosition();
    console.log("geo", coordinates);

    return coordinates.coords;
}

function successGeolocation(geo) {
    console.log("geolocalizacion", geo);
}

function errorGeolocation(error) {
    console.warn("geolocalizacion", error);
}

// Compartir app
async function compartirApp() {
    await Share.share({
        title: "Gastos y Finanzas",
        text: "Prueba esta aplicación!",
        url: "https://dwallet.develotion.com/site/",
        dialogTitle: "Compartir",
    });
}
