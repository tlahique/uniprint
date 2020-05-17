$(document).ready(function () {
	$('#menu-icon').on('click', function () {
		$('.navbar').toggleClass('expand');
		return false;
	});
});

var map = L.map('map');

//'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'

L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
}).addTo(map);

map.setView(new L.LatLng(25.72650, -100.31180), 16);

// 'control' previously called 'routingControl'
var control = L.Routing.control({
	// geocoder: L.Control.Geocoder.nominatim(),
	createMarker: function () { 
		return null; 
	},
	routeWhileDragging: false,
	addWaypoints: false,
	draggableWaypoints: false,
	router: L.Routing.graphHopper('7a90079e-b1d3-444d-aa31-f2986bb3a67c', {
		urlParameters: {
			vehicle: 'foot'
		},
	})
}).addTo(map);

control.hide();

var router = control.getRouter();
router.on('response',function(e){
  console.log('This request consumed ' + e.credits + ' credit(s)');
  console.log('You have ' + e.remaining + ' left');
});

////

function button(label, container) {
	var btn = L.DomUtil.create('button', '', container);
	btn.setAttribute('type', 'button');
	btn.innerHTML = label;
	return btn;
}

var startBtn;
var startmarker = new L.marker([25.72375857, -100.31251645], { draggable: 'false' });
var endmarker = new L.marker([25.72864538, -100.31225252], { draggable: 'false' });
map.on('click', function (e) {
	var container = L.DomUtil.create('div'),
		startBtn = button('Marca inicio de ruta, luego tu destino.', container);
	L.DomEvent.on(startBtn, 'click', function () {
		control.spliceWaypoints(0, 1, e.latlng);
		map.removeLayer(startmarker);
		startmarker = new L.marker(e.latlng, { draggable: 'false', icon: L.AwesomeMarkers.icon({ icon: 'fas fa-user-circle icon-white', prefix: 'fa', markerColor: 'darkpurple' }) });
		startmarker
		startmarker.on('dragend', function (event) {
			startmarker = event.target;
			var position = startmarker.getLatLng();
			control.spliceWaypoints(0, 1, position);
		});
		map.addLayer(startmarker);
		map.closePopup();
	});
	L.popup().setContent(container).setLatLng(e.latlng).openOn(map);
});

L.Routing.errorControl(control).addTo(map);  
