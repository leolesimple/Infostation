function afficherHeure() {
    let maintenant = new Date();
    let heures = maintenant.getHours().toString().padStart(2, '0');
    let minutes = maintenant.getMinutes().toString().padStart(2, '0');
    let secondes = maintenant.getSeconds().toString().padStart(2, '0');
    document.getElementById("now").innerHTML = heures + ":" + minutes + "<span>:" + secondes + "</span>";
}

document.addEventListener('DOMContentLoaded', function () {
    let elementNow = document.getElementById('now');
    if (elementNow) {
        elementNow.addEventListener('click', function () {
            this.classList.toggle('show');
        });
    }
    let elementConfig = document.getElementById('config');
    if (elementConfig) {
        elementConfig.addEventListener('click', function (event) {
            if (event.target.closest('form')) {
                return;
            }
            elementConfig.classList.toggle('showConfig');
            if (elementConfig.classList.contains('showConfig')) {
                localStorage.setItem("showConfigRER", true);
            } else {
                localStorage.setItem("showConfigRER", false);
            }
        });

    }
});

document.getElementById("now").classList.add("show");
if (localStorage.getItem("showConfigRER") === true) {
    document.getElementById("config").classList.add("showConfig");
}
afficherHeure();

setInterval(afficherHeure, 500);

if (navigator.onLine === false) {
    document.body.appendChild("<h1>Le système est hors ligne, veuillez vous reconnnecter !</h1>")
}