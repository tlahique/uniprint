// Get the <datalist> and <input> elements.
var facultyList = document.getElementById('faculty-list');
var facultyInput = document.getElementById('faculty-choice');
let classList = document.getElementById('class-list');
var classInput = document.getElementById('class-choice');

// Create a new XMLHttpRequest.
var request = new XMLHttpRequest();
var category_list = []
var popupMarkerArray = new L.FeatureGroup();

// Handle state changes for the request.
request.onreadystatechange = function (response) {
    if (request.readyState === 4) {
        if (request.status === 200) {
            // Parse the JSON
            window.jsonOptions = JSON.parse(request.responseText);

            // Loop over the JSON array.
            for (i in window.jsonOptions.Universidad.Facultades) {
                // Create a new <option> element.
                var option = document.createElement('option');
                // Set the value using the item in the JSON array.
                option.text = window.jsonOptions.Universidad.Facultades[i].nombre;
                // Add the <option> element to the <datalist>.
                $('#faculty-choice').append(option).trigger('change');
            };



            for (i in window.jsonOptions.Universidad.Facultades) {
                for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                    var category = window.jsonOptions.Universidad.Facultades[i].marcador[k].categoria
                    // console.log(jsonOptions.Universidad.Facultades[i].marcador[k].categoria)
                    if (category_list.includes(category) == false) {
                        category_list.push(category)
                    }
                }
            }


            
            for (i in category_list) {
                // Create a new <option> element.
                var option = document.createElement('option');
                // Set the value using the item in the JSON array.
                option.text = category_list[i]
                // Add the <option> element to the <datalist>.
                $('#class-choice').append(option).trigger('change');
            }

            // Update the placeholder text.
            facultyInput.placeholder = "Selecciona1";
            classInput.placeholder = "Selecciona1";
        } else {
            // An error occured :(
            facultyInput.placeholder = "Error :(";
        }
    }
};


// Update the placeholder text.
facultyInput.placeholder = "Cargando";

// Set up and make the request.
request.open('GET', 'https://raw.githubusercontent.com/tlahique/uniprint/master/data.json', true);
request.send();

function searchTags() {
    tagsValue = document.getElementById("tags").value.toLowerCase();
    window.marker = {}
    let tagsArray = []

    for (i in window.jsonOptions.Universidad.Facultades) {
        for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
            var tag = window.jsonOptions.Universidad.Facultades[i].marcador[k].tags
            if (tag.includes(tagsValue) == true) {
                loopIndex = [i, k]
                tagsArray.push(loopIndex)
            }
        }
    }

    json_create_markers(tagsArray)
}

function search() {
    window.marker = {}
    let ikArray = []

    facultad = document.getElementById("faculty-choice").value;
    categoria = document.getElementById("class-choice").value;
    // only work for empty forms, what if user types 'ssss'.
    if (facultad == '' || categoria == '') {
        
    } else if (facultad == "Ciudad Universitaria") { //SAM CHANGE, Ciudad Universitaria to Todas
        for (i in window.jsonOptions.Universidad.Facultades) {
            for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                if (categoria == 'Todo') {
                    loopIndex = [i, k]
                    ikArray.push(loopIndex)
                } else {
                    var category = window.jsonOptions.Universidad.Facultades[i].marcador[k].categoria
                    if (category == categoria) {
                        loopIndex = [i, k]
                        ikArray.push(loopIndex)
                    }
                }
            }
        }
    }
    else {
        for (i in window.jsonOptions.Universidad.Facultades) {
            if (window.jsonOptions.Universidad.Facultades[i].nombre == facultad) {
                if (categoria == 'Todo') { //SAM CHANGE, Todo to Todos
                    for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                        loopIndex = [i, k]
                        ikArray.push(loopIndex)
                    }
                    break;
                } else {
                    for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                        var category = window.jsonOptions.Universidad.Facultades[i].marcador[k].categoria
                        if (category == categoria) {
                            loopIndex = [i, k]
                            ikArray.push(loopIndex)
                        }
                    }
                    break;
                }
            }

        }
    }
    for (i in ikArray) {
        window.marker[i] = window.jsonOptions.Universidad.Facultades[ikArray[i][0]].marcador[ikArray[i][1]]
    }

    json_create_markers(ikArray)
    
}

function json_create_markers(json_array) {
    for (i in json_array) {
        window.marker[i] = window.jsonOptions.Universidad.Facultades[json_array[i][0]].marcador[json_array[i][1]]
    }

    // deletes and creates markers when user clicks search
    // https://stackoverflow.com/questions/24318862/removing-all-data-markers-in-leaflet-map-before-calling-another-json
    popupMarkerArray.clearLayers()

    for (i in window.marker) {
        // getInfoFrom writes to .bindPopup
        // https://gis.stackexchange.com/questions/261028/dynamically-create-leaflet-popup-via-javascript-object
        
        let nombre = "<h3>" + marker[i].nombre + "</h3>"
        //let imagen = '<img src="https://www.fime.me/members/dr-freud/albums/varios/2969-el-prometido-starbucks-version-fimena.jpg" class="img-fluid">'
        //SAM CHANGE, removed let imagen
        let descripcion = marker[i].descripcion
        let info = nombre + imagen + descripcion

        var coordenadasArray = marker[i].coordenadas.split(",")

        var jsonIcon = marker[i].icon

        // list of colors for icons
        if (marker[i].categoria == 'Papelería') {
            var jsonColor = 'orange'
        } else if (marker[i].categoria == 'Imprenta') {
            var jsonColor = 'red'
        } else if (marker[i].categoria == 'Facultad') { //SAM CHANGE, changed Bebederos to Facultad
            var jsonColor = 'blue'
        }

        var newMarker = L.marker([coordenadasArray[0], coordenadasArray[1]], { icon: L.AwesomeMarkers.icon({ icon: jsonIcon, prefix: 'fa', markerColor: jsonColor }) }).on('click', onClick).addTo(map);
        newMarker.bindPopup(info)
        popupMarkerArray.addLayer(newMarker)
    }
    map.addLayer(popupMarkerArray);
}

// when user clicks on marker, update routing destination
function onClick(e) {
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
    map.removeLayer(endmarker);
    endmarker = new L.marker(e.latlng, { draggable: 'false', icon: L.AwesomeMarkers.icon({ icon: 'location-arrow', prefix: 'fa', markerColor: 'darkpurple' }) });
    endmarker.on('dragend', function (event) {
        endmarker = event.target;
        var position = endmarker.getLatLng();
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, position);
        endmarker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'false' });
    });
    // map.addLayer(endmarker); don't show marker when selecting destination
    map.closePopup();
}

$('#faculty-choice').select2({
    placeholder: "Selecciona" //SAM CHANGE, changed text to Selecciona
});
$('#class-choice').select2({
    placeholder: "Selecciona" //SAM CHANGE, changed text to Selecciona
});

// https://stackoverflow.com/questions/37478727/how-can-i-make-a-browser-display-all-datalist-options-when-a-default-value-is-se
$('input').on('click', function () {
    $(this).attr('placeholder', $(this).val());
    $(this).val('');
});
$('input').on('mouseleave', function () {
    if ($(this).val() == '') {
        $(this).val($(this).attr('placeholder'));
    }
});

search();
