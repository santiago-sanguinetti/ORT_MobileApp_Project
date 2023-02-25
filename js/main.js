const baseUrl = "https://dwallet.develotion.com/";
let token = getSesionUsuario();

const $ = {};
iniciarApp();
function iniciarApp() {
    guardarElementos();
    agregarEventos();
    getDepartamentos();
}

function guardarElementos() {
    $.ionRouter = document.querySelector("ion-router");

    $.formRegistro = document.querySelector("#formRegistroUsuario");
    $.formLogin = document.querySelector("#formLoginUsuario");
}

function agregarEventos() {
    $.ionRouter.addEventListener("ionRouteDidChange", manejarRuta);

    $.formRegistro.addEventListener("submit", manejarRegistroUsuario);
    $.formLogin.addEventListener("submit", manejarLoginUsuario);
}

function manejarRegistroUsuario(event) {
    event.preventDefault();
    console.log("registro");

    const datos = obtenerDatosRegistro();
    console.log("registro", datos);
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
    console.log("login");

    const datos = obtenerDatosLogin();
    console.log(datos);
    loginUsuario(datos);
}

function obtenerDatosLogin() {
    return {
        usuario: $.formLogin.querySelector("#usuario").value,
        password: $.formLogin.querySelector("#password").value,
    };
}

function manejarRuta(event) {
    console.log("ruta", event);
    const path = event.detail.to;

    ocultarPageActiva();

    switch (path) {
        case "/":
            mostrarPageActiva("#page-home");
            break;
        case "/login":
            mostrarPageActiva("#page-login");
            break;
        case "/registro":
            mostrarPageActiva("#page-registro");
            break;
        case "/movimientos":
            mostrarPageActiva("#page-movimientos");
            break;
    }
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

function registrarUsuario() {
    const headers = {
        "Content-Type": "application/json",
    };
    const body = {
        usuario: "ss220503",
        password: "123",
        idDepartamento: 3204,
        idCiudad: 34,
    };

    fetch(`${baseUrl}/usuarios.php`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            console.log("then registro", jsonResponse);
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
            console.log("then login", jsonResponse);
            guardarSesionUsuario(jsonResponse.apiKey);
            console.log(jsonResponse.apiKey);
        })
        .catch(mostrarError);
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
            console.log(typeof jsonResponse.departamentos);
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

function mostrarError(error) {
    //se podría mostrar un mensaje en algún lado también
    console.warn(error);
}

function getJsonBody(response) {
    console.log(response);
    return response.json();
}

function guardarSesionUsuario(apiKey) {
    token = apiKey;
    guardarLocalStorage("tokenUsuario", token);
}

function guardarLocalStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function getSesionUsuario() {
    return leerLocalStorage("tokenUsuario", "");
}

function leerLocalStorage(clave, valorPorDefecto) {
    const valorStorage = JSON.parse(localStorage.getItem(clave));

    if (valorStorage === null) {
        return valorPorDefecto;
    } else {
        return valorStorage;
    }
}

function getRubros() {
    const headers = {
        "Content-Type": "application/json",
    };

    fetch(`${baseUrl}/rubros.php`, {
        method: "GET",
        headers: headers,
    })
        .then(getJsonBody)
        .then((jsonResponse) => {
            console.log(typeof jsonResponse.rubros);
            escribirRubros(json.Response.departamentos);
        })
        .catch(mostrarError);
}

function escribirRubros(rubros) {
    //esto debería ser similar a la de ciudades y departamentos
}
