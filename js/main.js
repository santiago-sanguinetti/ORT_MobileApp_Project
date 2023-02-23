const baseUrl = "https://dwallet.develotion.com/";
let token = "";

const $ = {};
iniciarApp();
function iniciarApp() {
    guardarElementos();
    agregarEventos();
}

function guardarElementos() {
    $.ionRouter = document.querySelector("ion-router");

    $.formRegistro = document.querySelector("#formRegistroUsuario");
    // $.formLogin = document.querySelector("#formLoginUsuario");
    $.slcDepartamento = document.querySelector("#departamento");
}

function agregarEventos() {
    $.ionRouter.addEventListener("ionRouterDidChange", manejarRuta);

    $.formRegistro.addEventListener("submit", manejarRegistroUsuario);
    // $.formLogin.addEventListener("submit", manejarLoginUsuario);
    $.slcDepartamento.addEventListener("click", getDepartamentos);
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

function loginUsuario() {
    const headers = {
        "Content-Type": "application/json",
    };
    const body = {
        usuario: "ss220503",
        password: "123",
    };

    fetch(`${baseUrl}/login.php`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    })
        .then(getJsonBody)
        .then(function (jsonResponse) {
            console.log("then login", jsonResponse);
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
            escribirDepartamentos(jsonResponse.data);
        })
        .catch(mostrarError);
}

function escribirDepartamentos(departamentos) {
    let departamentosHtml = "";

    for (let departamento of departamentos) {
        departamentosHtml += /*html*/ `
        <ion-select-option value="${departamento.id}">
        ${departamento.nombre}
        </ion-select-option>`;
    }

    document.querySelector("#slcDepartamentos").innerHTML = departamentosHtml;
}

function mostrarError(error) {
    //se podría mostrar un mensaje en algún lado también
    console.warn(error);
}

function getJsonBody(response) {
    console.log(response);
    return response.json();
}
