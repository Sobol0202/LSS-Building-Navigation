// ==UserScript==
// @name         LSS Building Navigation
// @namespace    www.leitstellenspiel.de
// @version      1.0
// @description  Fügt buttons für das nächste und vorherige gebaute Gebäude ein.
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/buildings/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Funktion zum Extrahieren der Gebäude-ID aus der aktuellen URL
    function getCurrentBuildingId() {
        const urlParts = window.location.href.split('/');
        return parseInt(urlParts[urlParts.length - 1]);
    }

    // Funktion zum Laden der Gebäude-API und Navigation zu vorherigem oder nächstem Gebäude
    function navigateBuilding(direction) {
        //console.log('Navigating', direction);
        const currentBuildingId = getCurrentBuildingId();

        // Gebäude-API aufrufen
        fetch("https://www.leitstellenspiel.de/api/buildings")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                //console.log('API response:', data);

                // Filtern des aktuellen Gebäudes
                const currentBuilding = data.find(building => building.id === currentBuildingId);

                // Filtern der Gebäude mit gleicher leitstelle_building_id
                const buildingsWithSameId = data.filter(building => building.leitstelle_building_id === currentBuilding.leitstelle_building_id);

                // Sortieren der Gebäude nach ID
                buildingsWithSameId.sort((a, b) => a.id - b.id);

                // Index des aktuellen Gebäudes im Array finden
                const currentIndex = buildingsWithSameId.findIndex(building => building.id === currentBuildingId);

                // Index des nächsten oder vorherigen Gebäudes berechnen
                const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

                // Überprüfen, ob das nächste oder vorherige Gebäude existiert
                if (newIndex >= 0 && newIndex < buildingsWithSameId.length) {
                    const newBuildingId = buildingsWithSameId[newIndex].id;
                    // Weiterleitung zur neuen Gebäude-ID
                    //console.log('Redirecting to', newBuildingId);
                    window.location.href = `https://www.leitstellenspiel.de/buildings/${newBuildingId}`;
                }
            })
            .catch(error => console.error('Error fetching/building data:', error));
    }

    // Funktion zum Hinzufügen der Navigationsschaltflächen
    function addNavigationButtons() {
        const buildingNavigationContainer = document.querySelector('#building-navigation-container');

        // Überprüfen, ob das Element vorhanden ist
        if (buildingNavigationContainer) {
            //console.log('Adding navigation buttons');

            // Neuen Buttons erstellen
            const prevButton = document.createElement('a');
            prevButton.href = '#';
            prevButton.className = 'btn btn-xs btn-success';
            prevButton.innerHTML = 'vorheriges gebautes Gebäude';
            prevButton.addEventListener('click', function(event) {
                event.preventDefault(); // Verhindert, dass der Link die Seite neu lädt
                //console.log('Prev button clicked');
                navigateBuilding('prev');
            });

            const nextButton = document.createElement('a');
            nextButton.href = '#';
            nextButton.className = 'btn btn-xs btn-success';
            nextButton.innerHTML = 'nächstes gebautes Gebäude';
            nextButton.addEventListener('click', function(event) {
                event.preventDefault();
                //console.log('Next button clicked');
                navigateBuilding('next');
            });

            // Buttons zum DOM hinzufügen, direkt unter den vorhandenen Buttons
            buildingNavigationContainer.appendChild(document.createElement('br'));
            buildingNavigationContainer.appendChild(prevButton);
            buildingNavigationContainer.appendChild(document.createTextNode(' '));
            buildingNavigationContainer.appendChild(nextButton);
        } else {
            console.error('Element with ID "building-navigation-container" not found.');
        }
    }

    // Warten Sie etwa 1 Sekunden, bevor die Navigationsschaltflächen hinzugefügt werden
    //setTimeout(function() {
        //console.log('Adding navigation buttons after delay');
        addNavigationButtons();
    //}, 1000);
})();
