
document.addEventListener("DOMContentLoaded", function () {
    var map = L.map("map", {
        center: [20, 30],
        zoom: 3,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    var shipIcon = L.icon({
        iconUrl: "ship_icon.jpg",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    var routeToHelsinki = [
        [35.1, 129.04], [33.0, 125.0], [30.0, 122.0], [22.0, 121.0],
        [18.0, 120.0], [10.0, 115.0], [5.0, 112.0], [1.5, 104.0],
        [3.0, 98.0], [10.0, 80.0], [13.0, 60.0], [15.0, 50.0],
        [13.5, 43.0], [18.0, 40.0], [22.0, 38.0], [30.0, 32.5],
        [32.0, 29.0], [35.0, 25.0], [36.0, 20.0],
        [37.0, 15.0], [38.0, 10.0], [36.0, -5.5], [38.0, -7.0],
        [42.0, -4.0], [48.0, -1.0], [50.0, 0.0], [52.0, 3.0], [54.0, 5.0],
        [56.0, 8.0], [57.5, 10.5], [58.0, 14.0], [60.0, 18.0],
        [60.17, 24.94]
    ];
    var routeToBusan = [...routeToHelsinki].reverse();

    var currentRoute = routeToHelsinki;
    var shipMarker = L.marker(currentRoute[0], { icon: shipIcon }).addTo(map);
    var polyline = L.polyline(routeToHelsinki, { color: 'blue', weight: 3 }).addTo(map);
    map.fitBounds(polyline.getBounds());

    let index = 0;
    let moving = false;
    let returning = false;
    let interval = null;
    let speed = 1000;

    function moveShip() {
        if (index < currentRoute.length && moving) {
            shipMarker.setLatLng(currentRoute[index]);
            index++;
        } else if (index >= currentRoute.length) {
            stopMoving();
        }
    }

    function startMoving(direction) {
        if (moving) return;
        if ((direction === 'helsinki' && returning) || (direction === 'busan' && !returning)) {
            returning = direction === 'busan';
            currentRoute = returning ? routeToBusan : routeToHelsinki;
            index = 0;
            shipMarker.setLatLng(currentRoute[0]);
        }
        moving = true;
        interval = setInterval(moveShip, speed);
    }

    function stopMoving() {
        moving = false;
        clearInterval(interval);
    }

    function restartInterval() {
        if (moving) {
            clearInterval(interval);
            interval = setInterval(moveShip, speed);
        }
    }

    function createButton(label, onClick) {
        var btn = L.DomUtil.create("button", "leaflet-bar leaflet-control leaflet-control-custom");
        btn.innerHTML = label;
        btn.style.backgroundColor = "white";
        btn.style.padding = "5px";
        btn.style.cursor = "pointer";
        btn.onclick = onClick;
        return btn;
    }

    var startButton = L.control({ position: "topright" });
    startButton.onAdd = () => createButton("▶ 부산항 - 헬싱키", () => startMoving('helsinki'));
    startButton.addTo(map);

    var stopButton = L.control({ position: "topright" });
    stopButton.onAdd = () => createButton("⏸ 멈춤", stopMoving);
    stopButton.addTo(map);

    var returnButton = L.control({ position: "topright" });
    returnButton.onAdd = () => createButton("🔄 헬싱키항 - 부산항", () => startMoving('busan'));
    returnButton.addTo(map);

    var returnStopButton = L.control({ position: "topright" });
    returnStopButton.onAdd = () => createButton("⏹ 멈춤", stopMoving);
    returnStopButton.addTo(map);

    // 속도 조절
    var speedControl = L.control({ position: "topright" });
    speedControl.onAdd = function () {
        var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
        container.style.backgroundColor = "white";
        container.style.padding = "5px";

        container.appendChild(createButton("🐢 느림", function () {
            speed = 2000;
            restartInterval();
        }));
        container.appendChild(createButton("🚶 보통", function () {
            speed = 1000;
            restartInterval();
        }));
        container.appendChild(createButton("🏃 빠름", function () {
            speed = 500;
            restartInterval();
        }));

        return container;
    };
    speedControl.addTo(map);

    var distanceLabel = L.control({ position: "bottomleft" });
    distanceLabel.onAdd = function () {
        var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
        div.innerHTML = `<b>🛳 총 항로 거리: 약 14,000km</b>`;
        div.style.backgroundColor = "white";
        div.style.padding = "10px";
        return div;
    };
    distanceLabel.addTo(map);
});
