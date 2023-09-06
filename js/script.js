// variables harcodeadas
let password = "operador1"
const maxAvionesEntrantes = 20
const maxAvionesSalientes = 10
const logoAerolineas = '../assets/img/aerolineas/Aerolineas_Argentinas.png'
const logoDelta = '../assets/img/aerolineas/Delta_Airlines.png'
const logoUnited = '../assets/img/aerolineas/United_Airlines.png'
const logoAlitalia = '../assets/img/aerolineas/Alitalia.png'

// declaracion de politicas
let polIntentos = 3

// array de aviones entrantes
let avionesEntrantes = []
let avionesEnTierra = []
let avionesSalientes = []

// genera un listado del estado actual del espacio aereo
function verEspacioAereo() {
    listarAviones(avionesEntrantes.concat(avionesSalientes))
}

function verAvionesEnTierra() {
    listarAviones(avionesEnTierra)
}

// agregamos un item al array pasado como parametro
function agregarAvion(array, matric, comp, est, logo) {
    array.push({ matricula: matric, compania: comp, estado: est, logo: logo })
}

// lista los aviones contenidos el el array recibido como parametro
function listarAviones(array) {
    let espacioAereo = document.getElementById("panelResultados")
    espacioAereo.innerHTML = ""
    array.forEach(element => {
        console.log(`${array.indexOf(element) + 1} - ${element.matricula} ( ${element.compania}) - ${element.estado}`)
        let aeronaveEnEspacioAereo = document.createElement("div")
        aeronaveEnEspacioAereo.className = "aeronave"
        aeronaveEnEspacioAereo.innerHTML = `<div class="elemento"><img src="${element.logo}" alt="logo compania"></div>
                                            <div class="elemento"><p>${element.compania}</p></div>                                    
                                            <div class="elemento"><p>${element.matricula}</p></div>
                                            <div class="elemento"><p>baliza: ${array.indexOf(element) + 1}</p></div>
                                            <div class="elemento"><p>${element.estado}</p></div>`
        if (element.estado === "saliente") {
            aeronaveEnEspacioAereo.innerHTML += `<button class="boton" id="btnEmergencia" onclick="declararEmergencia('${element.matricula}')">declarar emergencia</button>
                                                 <button class="boton" id="btnLiberarAeronave" onclick="liberarAvion('${element.matricula}')">liberar aeronave</button>`
        } else if (element.estado === "aterrizado") {
            aeronaveEnEspacioAereo.innerHTML += `<button class="boton" id="btnAutorizarDespegue" onclick="despegarAvion('${element.matricula}')">autorizar despegue</button>`
        } else if (element.estado === "entrante") {
            aeronaveEnEspacioAereo.innerHTML += `<button class="boton" id="btnEmergencia" onclick="declararEmergencia('${element.matricula}')">declarar emergencia</button>`
        }
        espacioAereo.appendChild(aeronaveEnEspacioAereo)
    });
}


// recibimos un avion entrante al area de control
// parametros: matric (matricula de la aeronave)
//             comp (compania aerea)
function recibirAvion(matric, comp) {
    // valida formato de la matricula
    if (!validarMatricula(matric.toUpperCase())) {
        alert('INFORMACION (ERROR) - matricula no valida')
        // valida existencia de la matricula
    } else if (validarExistenciaMatricula(matric.toUpperCase())) {
        alert('INFORMACION (ERROR) - matricula existente')
    } else {
        let logo = ''
        switch (comp) {
            case 'AEROLINEAS ARGENTINAS':
                logo = logoAerolineas
                break
            case 'ALITALIA':
                logo = logoAlitalia
                break
            case 'UNITED AIRLINES':
                logo = logoUnited
                break
            case 'DELTA AIRLINES':
                logo = logoDelta
                break
            default:
                logo = ''
        }
        avionesEntrantes.push({ matricula: matric.toUpperCase(), compania: comp, estado: 'entrante', logo: logo })

        // actualizo la informacion de aviones entrantes en el localStorage
        localStorage.removeItem("avionesEntrantes")
        localStorage.setItem("aeronavesEntrantes", JSON.stringify(avionesEntrantes))

        alert(`INFORMACION - (la aeronave ${matric.toUpperCase()} de la compania ${comp} ha sido recibido en el espacio aereo)`)
        verEspacioAereo()
    }
}

// libera un avion del espacio aereo dejando de estar bajo el control de la torre
function liberarAvion(matric) {
    const indiceLiberacion = avionesSalientes.indexOf(avionesSalientes.find((avion) => avion.matricula === matric))
    if (indiceLiberacion >= 0) {
        avionesSalientes.splice(indiceLiberacion, 1)
        alert(`INFORMACION - la aeronave con matricula ${matric} ha sido liberada del espacio aereo`)
    } else {
        alert(`>>> ALERTA <<< ( error de comunicacion con la aeronave ${matric} )`)
    }

    // actualizo la informacion de aviones salientes en el localStorage
    localStorage.removeItem("avionesSalientes")
    localStorage.setItem("aeronavesSalientes", JSON.stringify(avionesSalientes))

    verEspacioAereo()
}

// al declarar una declararEmergencia
// si es avion entrante pasa a tener ID = 0
// si es avion saliente se saca del array de avionesSalientes y se ingresa al array de avionesEntrantes con ID = 0
function declararEmergencia(matric) {

    // verificar existencia de emergencia sin resolver
    if (localStorage.getItem("emergenciaHora")) {
        alert(">>> ALERTA <<< (debe resolverse la emergencia en curso aterrizando la aeronave antes de poder declarar otra) \n > matricula en emergencia: " + localStorage.getItem("emergenciaMatricula") + "\n > emergencia hora: " + localStorage.getItem("emergenciaHora"))
        return
    }

    // si no existen emergencias sin resolver, permite declarar una nueva emergencia
    alert(">>> ALERTA <<< (emergencia declarada para la matricula: " + matric + ")")
    const resultadoBusquedaEntrantes = avionesEntrantes.find((avion) => avion.matricula === matric)
    if (resultadoBusquedaEntrantes) {
        // logica para asignar prioridad de aterrizaje
        let indice = avionesEntrantes.indexOf(resultadoBusquedaEntrantes)
        // elimino el objeto de la posicion original
        avionesEntrantes.splice(indice, 1)
        // agrego el avion al inicio del array para darle prioridad de aterrizaje
        avionesEntrantes.unshift(resultadoBusquedaEntrantes)
        avionesEntrantes[0].estado = 'EN EMERGENCIA (con prioridad para aterrizaje)'
    } else {
        // busco el avion en el listado de aviones salientes
        const resultadoBusquedaSalientes = avionesSalientes.find((avion) => avion.matricula === matric)
        if (resultadoBusquedaSalientes) {
            // logica para transferir a aviones entrantes y darle prioridad de aterrizaje
            let indice = avionesSalientes.indexOf(resultadoBusquedaSalientes)
            // saco el avion del listado de aviones salientes
            avionesSalientes.splice(indice, 1)
            // agrego el avion al inicio del array de aviones entrantes para darle prioridad de aterrizaje
            avionesEntrantes.unshift(resultadoBusquedaSalientes)
            avionesEntrantes[0].estado = 'EN EMERGENCIA (con prioridad para aterrizaje)'
        }
    }
    // almaceno el log de emergencias en el localstorage
    localStorage.setItem("emergenciaMatricula", matric)
    let fecha = new Date();
    localStorage.setItem("emergenciaHora", fecha)

    let parrafoAlerta = document.createElement("p")
    parrafoAlerta.className = "mensajeAlerta"
    parrafoAlerta.innerHTML = ">>> EMERGENCIA EN PROCESO <<< matricula: " + localStorage.getItem("emergenciaMatricula") + " ( " + localStorage.getItem("emergenciaHora") + " )"
    alerta.appendChild(parrafoAlerta)

    verEspacioAereo()
}

// aterriza el avion con indice 0
function aterrizarAvion() {

    if (localStorage.getItem("emergenciaMatricula")) {
        // elimino las claves referentes a emergencias del localStorage
        localStorage.removeItem("emergenciaHora")
        localStorage.removeItem("emergenciaMatricula")

        // elimino el mensaje de alerta
        const contenedor = document.querySelector(".alerta");
        const item = contenedor.querySelector(".mensajeAlerta:nth-child(1)");
        contenedor.removeChild(item); // Desconecta el segundo .item
    }

    avionesEntrantes.shift()
    verEspacioAereo()
}

// autoriza el despegue de una avion en base a la matricula recibida como parametro
// saca el avion del grupo de aviones en tierra y lo agrega al grupo aviones salientes
function despegarAvion(matric) {
    const indiceDespegue = avionesEnTierra.indexOf(avionesEnTierra.find((avion) => avion.matricula === matric))
    if (indiceDespegue >= 0) {
        const companiaAerea = avionesEnTierra[indiceDespegue].compania
        let logo = ''
        switch (companiaAerea) {
            case 'AEROLINEAS ARGENTINAS':
                logo = logoAerolineas
                break
            case 'ALITALIA':
                logo = logoAlitalia
                break
            case 'UNITED AIRLINES':
                logo = logoUnited
                break
            case 'DELTA AIRLINES':
                logo = logoDelta
                break
            default:
                logo = ''
        }
        avionesEnTierra.splice(indiceDespegue, 1)
        agregarAvion(avionesSalientes, matric, companiaAerea, 'saliente', logo)
        alert(`INFORMACION (la aeronave con matricula ${matric} ha sido autorizado para el despegue)`)
    } else {
        alert(">>> ALERTA <<< (se produjo un error de comunicacion al autorizar el despegue)")
    }

    // actualizo la informacion de aviones salientes en el localStorage
    localStorage.removeItem("avionesSalientes")
    localStorage.setItem("aeronavesSalientes", JSON.stringify(avionesSalientes))

    verEspacioAereo()
}

// busca por compania aerea entre los aviones entrantes, salientes y aterrizados 
function buscarCompania(busqueda) {
    const resultadoEntrantes = avionesEntrantes.filter(avion => avion.compania.includes(busqueda))
    const resultadoSalientes = avionesSalientes.filter(avion => avion.compania.includes(busqueda))
    const resultadoAterrizados = avionesEnTierra.filter(avion => avion.compania.includes(busqueda))
    const resultado = resultadoEntrantes.concat(resultadoSalientes.concat(resultadoAterrizados))

    console.log(resultadoEntrantes)
    console.log(resultadoSalientes)
    console.log(resultadoAterrizados)
    console.log(resultado)

    // ordeno el resultado de la concatenacion de arrays por matricula
    resultado.sort((aeroNave1, aeroNave2) => {
        if (aeroNave1.matricula === aeroNave2.matricula) {
            return 0
        }
        if (aeroNave1.matricula > aeroNave2.matricula) {
            return 1
        }
        if (aeroNave1.matricula < aeroNave2.matricula) {
            return -1
        }
    })
    listarAviones(resultado)
}

// valida el formato de la matricula
// debe tener longitud de 6
// tres caracteres del tipo string
// tres caracteres del tipo numerico
function validarMatricula(valor) {
    let matriculaValidada = true
    if (valor.length != 6) {
        matriculaValidada = false
    } else if (!isNaN(valor.substring(0, 3))) {
        matriculaValidada = false
    } else if (isNaN(valor.substring(3, 6))) {
        matriculaValidada = false
    }
    return matriculaValidada
}

// verifica que no exista la matricula que se quiere ingresar
function validarExistenciaMatricula(valor) {
    if (avionesEnTierra.find((avion) => avion.matricula === valor)) {
        return true
    } else if (avionesEntrantes.find((avion) => avion.matricula === valor)) {
        return true
    } else if (avionesSalientes.find((avion) => avion.matricula === valor)) {
        return true
    }
    return false
}

// datos precargados para facilitar el testeo
function cargarArrays() {
    avionesEnTierra.push({ matricula: 'AAA111', compania: 'AEROLINEAS ARGENTINAS', estado: 'aterrizado', logo: logoAerolineas })
    avionesEnTierra.push({ matricula: 'BBB222', compania: 'DELTA AIRLINES', estado: 'aterrizado', logo: logoDelta })
    avionesEnTierra.push({ matricula: 'CCC333', compania: 'UNITED AIRLINES', estado: 'aterrizado', logo: logoUnited })
    avionesEnTierra.push({ matricula: 'DDD444', compania: 'ALITALIA', estado: 'aterrizado', logo: logoAlitalia })
    avionesEnTierra.push({ matricula: 'EEE555', compania: 'AEROLINEAS ARGENTINAS', estado: 'aterrizado', logo: logoAerolineas })
    avionesEntrantes.push({ matricula: 'FFF666', compania: 'ALITALIA', estado: 'entrante', logo: logoAlitalia })
    avionesEntrantes.push({ matricula: 'GGG777', compania: 'AEROLINEAS ARGENTINAS', estado: 'entrante', logo: logoAerolineas })
    avionesEntrantes.push({ matricula: 'MDF222', compania: 'AEROLINEAS ARGENTINAS', estado: 'entrante', logo: logoAerolineas })
    avionesEntrantes.push({ matricula: 'RJT566', compania: 'UNITED AIRLINES', estado: 'entrante', logo: logoUnited })
    avionesEntrantes.push({ matricula: 'MDF222', compania: 'UNITED AIRLINES', estado: 'entrante', logo: logoUnited })
    avionesSalientes.push({ matricula: 'HHH888', compania: 'UNITED AIRLINES', estado: 'saliente', logo: logoUnited })
    avionesSalientes.push({ matricula: 'III999', compania: 'AEROLINEAS ARGENTINAS', estado: 'saliente', logo: logoAerolineas })
    avionesSalientes.push({ matricula: 'ADS123', compania: 'DELTA AIRLINES', estado: 'saliente', logo: logoDelta })
    avionesSalientes.push({ matricula: 'ODF222', compania: 'DELTA AIRLINES', estado: 'saliente', logo: logoDelta })
    avionesSalientes.push({ matricula: 'DLF234', compania: 'AEROLINEAS ARGENTINAS', estado: 'saliente', logo: logoAerolineas })
    avionesSalientes.push({ matricula: 'CDS977', compania: 'AEROLINEAS ARGENTINAS', estado: 'saliente', logo: logoAerolineas })
}

const login = () => {
    // let loginSuccessfull = false;
    // for (let a = polIntentos; a > 0; a--) {
    //     let inputPassword = prompt("ingrese password: ")
    //     if (inputPassword === password) {
    //         loginSuccessfull = true
    //         break
    //     } else {
    //         alert(`password incorrecto, tiene ${a} intentos restantes`)
    //     }
    // }
    // return loginSuccessfull
    return true
}



if (login()) {

    var preCargaArrays = window.confirm("desea cargar datos de test en el sistema?");
    if (preCargaArrays) {
        cargarArrays()
    }

    console.log('control de trafico aereo')
    // alert('INFORMACION - se realizo la precarga de datos en los arrays para la facilidad de testeo')

    // lista en pantalla el espacio aereo
    let btnVerEspacioAereo = document.getElementById("verEspacioAereo")
    btnVerEspacioAereo.onclick = () => { verEspacioAereo() }

    // autoriza el aterrizaje al avion con id = 0
    let btnAutorizarAterrizaje = document.getElementById("aterrizarAeronave")
    btnAutorizarAterrizaje.onclick = () => {
        console.log('aterrizar aeronave')
        if (avionesEntrantes.length > 0) {
            const matric = avionesEntrantes[0].matricula
            const aerolinea = avionesEntrantes[0].compania
            let logo = ''
            switch (aerolinea) {
                case 'AEROLINEAS ARGENTINAS':
                    logo = logoAerolineas
                    break
                case 'ALITALIA':
                    logo = logoAlitalia
                    break
                case 'UNITED AIRLINES':
                    logo = logoUnited
                    break
                case 'DELTA AIRLINES':
                    logo = logoDelta
                    break
                default:
                    logo = ''
            }
            agregarAvion(avionesEnTierra, matric, aerolinea, 'aterrizado', logo)
            console.log(`aeronave ${matric} perteneciente a ${aerolinea} ahora esta en tierra`)
            aterrizarAvion()
            console.log('>>> solicitud completa <<<')
            alert(`INFORMACION (aeronave ${matric} perteneciente a ${aerolinea} ahora esta en tierra)`)
        } else {
            alert('INFORMACION (no hay aviones en espera para el aterrizaje)')
        }
    }

    // buscar y listar aviones de una aerolinea
    let busqueda = document.getElementById("busquedaAerolinea")
    let btnBuscarAerolinea = document.getElementById("btnBuscarAerolinea")
    btnBuscarAerolinea.addEventListener("click", () => { buscarCompania(busqueda.value.toUpperCase()) })

    //recibir avion al espacio aereo
    let matricula = document.getElementById("matricula")
    let companiaAerea = document.getElementById("companiaAerea")
    btnRecibirAeronave = document.getElementById("recibirAeronave")
    btnRecibirAeronave.addEventListener("click", () => { recibirAvion(matricula.value, companiaAerea.value) })

    // ver aviones en tierra
    let btnVerAvionesEnTierra = document.getElementById("avionesEnTierra")
    btnVerAvionesEnTierra.addEventListener("click", () => { verAvionesEnTierra() })

    // verificar alerta existente
    let alerta = document.getElementById("alerta")
    let parrafoAlerta = document.createElement("p")
    parrafoAlerta.className = "mensajeAlerta"
    if (localStorage.getItem("emergenciaMatricula")) {
        parrafoAlerta.innerHTML = ">>> EMERGENCIA EN PROCESO <<< matricula: " + localStorage.getItem("emergenciaMatricula") + " ( " + localStorage.getItem("emergenciaHora") + " )"
        alerta.appendChild(parrafoAlerta)
    }

    // verifica actividad existente en el espacio aereo
    // if (!localStorage.getItem("aeronavesEntrantes")) {
    //     avionesEntrantes = JSON.parse(localStorage.getItem("aeronavesEntrantes"))
    //     console.log(avionesEntrantes)
    // } else {
    //     alert("existe")
    // }

} else {
    console.log("el usuario ha sido bloqueado")
}