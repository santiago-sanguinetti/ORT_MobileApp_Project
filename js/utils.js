function crearUrl(baseUrl, params) {
  const urlObj = new URL(baseUrl);
  urlObj.search = new URLSearchParams(params).toString();
  return urlObj.href;
}

function paramsToObject(params) {
  const result = {};
  for (const [key, value] of params.entries()) {
    // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}

function removeHash(str) {
  return str.replace("#", "");
}

function getUrlParams(url) {
  const decodedUrl = decodeURI(removeHash(url));
  const urlObj = new URL(decodedUrl);
  return paramsToObject(urlObj.searchParams);
}

function guardarLocalStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function leerLocalStorage(clave, valorPorDefecto) {
  const valorStorage = JSON.parse(localStorage.getItem(clave));

  if (valorStorage === null) {
    return valorPorDefecto;
  } else {
    return valorStorage;
  }
}
