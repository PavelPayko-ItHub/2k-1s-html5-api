const checkApiSupport = () => {
  const features = {
    "File API": "File" in window,
    "FileReader API": "FileReader" in window,
    "LocalStorage": "localStorage" in window,
    "SessionStorage": "sessionStorage" in window,
    "Canvas API": "HTMLCanvasElement" in window,
    "Web Workers API": "Worker" in window,
    "Web Socket API": "WebSocket" in window,
    "Geolocation API": "geolocation" in navigator,
    "IndexedDB": "indexedDB" in window,
    "Web Storage API": "Storage" in window,
    "History API": "history" in window && "pushState" in history,
    "Drag and Drop API": "draggable" in document.createElement("div"),
    "Audio API": "Audio" in window,
    "Video API": "HTMLVideoElement" in window,
  };
  for (const feature in features) {
    const supported = features[feature] ? "поддерживается" : "не поддерживается";
    const listItem = document.createElement("p");
    listItem.textContent = feature + ": " + supported + "\n";
    let apitest = document.getElementById("test_api");
    apitest.appendChild(listItem);
  }
}

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    document.getElementById("location").innerHTML =
      "Геолокация не поддерживается.";
  }
}

const showPosition = (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  document
    .getElementById("location")
    .innerHTML =
      "Текушие координаты: " + "<br>" + "Широта: " + lat + "<br>Долгота: " + lon;

  const currentPosition = [{ name: "myLastgeo", pos: [lat, lon] }];
  localStorage.setItem("mygeoposition", JSON.stringify(currentPosition));

  const timestamp = new Date();
  console.info(timestamp);
}

const saveLocation = (type, name, pos) => {
  let marker = JSON.parse(localStorage.getItem(type)) || [];
  marker.push({ name, pos });
  localStorage.setItem(type, JSON.stringify(marker));
}

const createMap = () => {
  const geolocation = ymaps.geolocation,
    myMap = new ymaps.Map(
      "map",
      {
        center: [55.713425, 37.632022],
        zoom: 10,

        controls: ["routeButtonControl"],
      },
      {
        searchControlProvider: "yandex#search",
      }
    );

  geolocation
    .get({
      provider: "browser",
      mapStateAutoApply: true,
    })
    .then(function (result) {
      result.geoObjects.options.set("preset", "islands#redCircleIcon");
      myMap.geoObjects.add(result.geoObjects);
    });

  document
    .getElementById("markerForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const search = document.getElementById("searchInput").value;

      const myGeocoder = ymaps.geocode(search);

      myGeocoder.then(
        function (res) {
          const placemark = new ymaps.Placemark(
            res.geoObjects.get(0).geometry.getCoordinates(),
            {
              hintContent: search,
              balloonContent: search,
            }
          );

          // Добавляем метку в localstorage
          saveLocation(
            "markers",
            search,
            res.geoObjects.get(0).geometry.getCoordinates()
          );
          myMap.geoObjects.add(placemark);
        },

        function (err) {
          alert("Ошибка");
          console.error(err)
        }
      );
    });

  const showSavedData = (type) => {
    const saved = JSON.parse(localStorage.getItem(type));
    for (const i in saved) {
      const marker = saved[i];
      const placemark = new ymaps.Placemark(marker.pos, {
        hintContent: marker.name,
        balloonContent: marker.name,
      });

      myMap.geoObjects.add(placemark);
    }
  }

  showSavedData("markers");
  navigator.geolocation.getCurrentPosition(
    function(position){
    }, function(error){
      if(error.PERMISSION_DENIED){
        showSavedData("mygeoposition");
      }
  });    
  }

const deleteMarkers = () => {
  localStorage.removeItem("markers");
  location.reload();
}

getLocation();


window.onload = checkApiSupport;
ymaps.ready(createMap);