const urlLignes = "./json/metro/lignes.json";
let urlArret;
let jsonMetroA;
let jsonMetroR;
let jsonArrets;
let stop_Id_A;
let stop_Id_R;
let LigneInfo;
const jsonLignes = {
        "tram": {
            "1": {
                "code": "C01389",
                "arretsIndex": "arrets-tram-1.json",
                "icon": "tram-1.svg"
            },
            "2": {
                "code": "C01390",
                "arretsIndex": "arrets-tram-2.json",
                "icon": "tram-2.svg"
            },
            "3a": {
                "code": "C01391",
                "arretsIndex": "arrets-tram-3a.json",
                "icon": "tram-3a.svg"
            },
            "3b": {
                "code": "C01679",
                "arretsIndex": "arrets-tram-3b.json",
                "icon": "tram-3b.svg"
            },
            "4": {
                "code": "C01843",
                "arretsIndex": "arrets-tram-4.json",
                "icon": "tram-4.svg"
            },
            "5": {
                "code": "C01684",
                "arretsIndex": "arrets-tram-5.json",
                "icon": "tram-5.svg"
            },
            "6": {
                "code": "C01794",
                "arretsIndex": "arrets-tram-6.json",
                "icon": "tram-6.svg"
            },
            "7": {
                "code": "C01774",
                "arretsIndex": "arrets-tram-7.json",
                "icon": "tram-7.svg"
            },
            "8": {
                "code": "C01795",
                "arretsIndex": "arrets-tram-8.json",
                "icon": "tram-8.svg"
            },
            "9": {
                "code": "C02317",
                "arretsIndex": "arrets-tram-9.json",
                "icon": "tram-9.png"
            },
            "10": {
                "code": "C02528",
                "arretsIndex": "arrets-tram-10.json",
                "icon": "tram-10.png"
            },
            "11": {
                "code": "C01999",
                "arretsIndex": "arrets-tram-11.json",
                "icon": "tram-11.png"
            },
            "12": {
                "code": "C02529",
                "arretsIndex": "arrets-tram-12.json",
                "icon": "tram-12.png"
            },
            "13": {
                "code": "C02344",
                "arretsIndex": "arrets-tram-13.json",
                "icon": "tram-13.svg"
            }
        }
    }
;


stop_Id_A = localStorage.getItem("stopIdTramA");
stop_Id_R = localStorage.getItem("stopIdTramR");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const getLine = urlParams.get('line').toString();
console.log(getLine)

if (!getLine) {
    document.location.href = "index.html";
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Erreur de chargement du fichier JSON : ${response.statusText}`);
    }
    return response.json();
}

async function updateHorairesMetro(stopIdA, stopIdR, line) {
    const apiHeaders = {
        'Accept': 'application/json',
        'apikey': "SA2gwXmU8tMANuVvb1cei7oQc3FjEGOQ"
    };

    try {
        const apiOptions = {
            headers: apiHeaders
        };

        const [jsonMetroAData, jsonMetroRData] = await Promise.all([
            fetchJson(`https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=STIF:StopPoint:Q:${stopIdA}:`, apiOptions),
            fetchJson(`https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=STIF:StopPoint:Q:${stopIdR}:`, apiOptions)
        ]);

        jsonMetroA = jsonMetroAData;
        jsonMetroR = jsonMetroRData;

        LigneInfo = jsonLignes.tram[line];
        if (!LigneInfo || !LigneInfo.arretsIndex) {
            console.error('Ligne ou arretsIndex non trouvé');
            return;
        }

        urlArret = "./json/tram/" + LigneInfo.arretsIndex;
        jsonArrets = await fetchJson(urlArret);

        const getLine = urlParams.get('line'); // Assure-toi que cette partie est correctement définie
        let image = document.getElementById('icon');
        if (image) {
            image.src = "./img/lignes/" + LigneInfo.icon + "";
        } else {
            console.error("L'élément 'icon' n'existe pas dans le DOM");
        }
        setTimeout(() => prochainMetro(line), 700);

    } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
    }
}

updateHorairesMetro(stop_Id_A, stop_Id_R, getLine);


function prochainMetro(ligne) {

    let station;
    const jsonDirections = [
        {jsonMetro: jsonMetroA, horairesId: 'horaires_s1'},
        {jsonMetro: jsonMetroR, horairesId: 'horaires_s2'}
    ];

    jsonDirections.forEach(direction => {
        const monitoredStopVisits = direction.jsonMetro.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
        if (monitoredStopVisits.length > 0) {
            document.getElementById('station').textContent = station = monitoredStopVisits[0].MonitoredVehicleJourney.MonitoredCall.StopPointName[0].value;
        }
        if (document.getElementById(direction.horairesId)) {
            document.getElementById(direction.horairesId).innerHTML = '';
        }

        monitoredStopVisits.forEach((stopVisit, index) => {
            let arrivalCountdown;
            let expectedArrivalTimestamp;
            const monitoredVehicleJourney = stopVisit.MonitoredVehicleJourney;
            const lineref = monitoredVehicleJourney.LineRef.value;
            let destName = monitoredVehicleJourney.DestinationName[0].value;
            const expectedArrivalTime = monitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime;
            const expectedDepartureTime = monitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime;
            let heure_passage;
            let ml = '';
            const now = new Date();
            document.getElementById('station').textContent = station;

            if (destName !== station) {
                expectedArrivalTimestamp = new Date(expectedDepartureTime).getTime();
            } else {
                expectedArrivalTimestamp = new Date(expectedArrivalTime).getTime();
            }
            arrivalCountdown = Math.floor((expectedArrivalTimestamp - now) / (1000 * 60));

            if (arrivalCountdown > 59) {
                const arrivalTime = new Date(expectedArrivalTimestamp);

                const hours = arrivalTime.getHours();
                const minutes = arrivalTime.getMinutes();

                const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
                const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

                ml = `${formattedHours}:${formattedMinutes}`
            }

            if (station === "La Défense (Grande Arche)") {
                station = "La Défense"
            } else if (station === "Porte Dauphine (Maréchal de Lattre de Tassigny)") {
                station = "Porte Dauphine"
            } else if (station === "Gallieni (Parc de Bagnolet)") {
                station = "Gallieni"
            }

            if (destName === "La Défense (Grande Arche)") {
                destName = "La Défense"
            } else if (destName === "Porte Dauphine (Maréchal de Lattre de Tassigny)") {
                destName = "Porte Dauphine"
            } else if (destName === "Gallieni (Parc de Bagnolet)") {
                destName = "Gallieni"
            }

            if (lineref === "STIF:Line::" + LigneInfo.code + ":" && destName !== station) {
                if (arrivalCountdown <= 0) {
                    heure_passage = "<span class='ultra-text blink' style='color:orangered'>" + "0" + '</span><span> min</span>';
                } else if (ml.includes(":")) {
                    heure_passage = "<span class='ultra-text' style='color:orange'>" + ml + '</span><span></span>';
                } else if (arrivalCountdown === 1) {
                    heure_passage = "<span class='ultra-text' style='color:orange'>" + arrivalCountdown + '</span><span> min</span>';
                } else {
                    heure_passage = "<span class='ultra-text' style='color:orange'>" + arrivalCountdown + '</span><span> mins</span>';
                }


                if (arrivalCountdown > -2 && destName !== station) {
                    const divHoraireRow = document.createElement('div');
                    divHoraireRow.className = 'horaire-row';
                    divHoraireRow.id = 'genHor' + index;

                    const divContainer = document.createElement('div');

                    const h1Dest = document.createElement('h1');
                    h1Dest.className = 'dest';
                    h1Dest.id = 'destination' + index;
                    h1Dest.textContent = destName;

                    const h3Heure = document.createElement('h3');
                    h3Heure.className = 'heure';
                    h3Heure.id = 'heure' + index;
                    h3Heure.innerHTML = heure_passage;

                    divContainer.appendChild(h1Dest);
                    divHoraireRow.appendChild(divContainer);
                    divHoraireRow.appendChild(h3Heure);

                    if (station === "Château de Vincennes" || station === "La Défense (Grande Arche)") {
                        document.getElementById('horaires_s1').appendChild(divHoraireRow);
                        if (document.getElementById('horaires_s2')) {
                            document.getElementById('horaires_s2').remove()
                        }
                    } else {
                        document.getElementById(direction.horairesId).appendChild(divHoraireRow);
                    }
                } else if (arrivalCountdown < -60) {
                    const divHoraireRow = document.createElement('div');
                    divHoraireRow.className = 'horaire-row';
                    divHoraireRow.id = 'genHor' + index;

                    const h1Dest = document.createElement('h1');
                    h1Dest.className = 'dest';
                    h1Dest.id = 'destination' + index;
                    h1Dest.textContent = "Aucun passage n'est prévu";

                    divHoraireRow.appendChild(h1Dest);

                    document.getElementById('horaires').appendChild(divHoraireRow);
                }
            }
        })
    });
}

function initFlex() {
    let horairesDiv = document.getElementById("horaires_s1");
    if (horairesDiv.children.length > 1) {
        horairesDiv.style.flexDirection = "column";
    }
}


function rechercherStation() {
    const inputValue = document.getElementById('stationSearch').value.toLowerCase();
    const resultsContainer = document.getElementById('stationSearchResults');
    resultsContainer.innerHTML = '';

    let arretsMap = {};

    jsonArrets.forEach(arret => {
        const stopNameLowerCase = arret.stop_name.toLowerCase();
        if (!arretsMap[stopNameLowerCase]) {
            arretsMap[stopNameLowerCase] = {
                stopIds: [],
                stopName: arret.stop_name
            };
        }
        arretsMap[stopNameLowerCase].stopIds.push(arret.stop_id);
    });

    Object.keys(arretsMap).forEach(stopNameLowerCase => {
        if (stopNameLowerCase.includes(inputValue)) {
            const li = document.createElement('li');
            li.textContent = arretsMap[stopNameLowerCase].stopName;

            li.addEventListener('click', () => onStationClick(arretsMap[stopNameLowerCase].stopIds.join(','), arretsMap[stopNameLowerCase].stopName));
            resultsContainer.appendChild(li);
            console.info(stopNameLowerCase);
        }
    });

    if (resultsContainer.children.length > 0) {
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.style.display = 'none';
    }
}

function onStationClick(stopId, stopName) {
    const stopIds = stopId.split(',');
    console.log(`Stop IDs: ${stopIds.join(', ')}, Stop Name: ${stopName}`);
    document.getElementById('stationSearch').value = stopName;
    document.getElementById('stationSearchResults').style.display = 'none';

    let extractedIdA, extractedIdR;

    let stopIdCount = 0;
    stopIds.forEach(id => {
        if (stopIdCount % 2 === 0) {
            extractedIdA = extractStopId(id.trim());
        } else {
            extractedIdR = extractStopId(id.trim());
        }
        stopIdCount += 1
    });
    updateHorairesMetro(extractedIdA, extractedIdR, getLine);

    const firstStopId = extractStopId(stopIds[0].trim());
    const secStopId = extractStopId(stopIds[1].trim());
    localStorage.setItem("stopIdM1A", firstStopId);
    localStorage.setItem("stopIdM1R", secStopId);
    prochainMetro();
}


function extractStopId(stopId) {
    return stopId.split(':').pop(); // Extraire la dernière partie après le dernier ":"
}

window.onload = function () {
    setTimeout(prochainMetro, 700);
    setTimeout(initFlex, 700);
};

setInterval(updateHorairesMetro(stop_Id_A, stop_Id_R, getLine), 19000);
setInterval(prochainMetro, 20000);