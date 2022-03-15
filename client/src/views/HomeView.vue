<template>
  <div class="h-screen relative">
    <GeoErrorModal
      @closeGeoError="closeGeoError"
      v-if="geoError"
      :geoErrorMsg="geoErrorMsg"
    />
    <MapFeatures
      @getGeoLocation="getGeoLocation"
      :coords="coords"
      :fetchCoords="fetchCoords"
      @plotResult="plotResult"
      :searchResults="searchResults"
      @toggleSearchResults="toggleSearchResults"
      @removeResult="removeResult"
    />
    <div id="map" class="h-full z-[1]"></div>
  </div>
</template>

<script>
import leaflet from 'leaflet'
import { onMounted, ref } from 'vue'
import GeoErrorModal from '../components/GeoErrorModal.vue'
import MapFeatures from '../components/MapFeatures.vue'
export default {
  name: 'HomeView',
  components: { GeoErrorModal, MapFeatures },
  setup() {
    let map
    onMounted(() => {
      // INIT MAP

      map = leaflet.map('map').setView([52.214339, 21.022339], 13)

      // TILE LAYER

      leaflet
        .tileLayer(
          `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2t1Y3phZmlrcyIsImEiOiJjbDBuaXlxN3Ewamh0M2tudHU0aG1icGh6In0.XMNMzYQMl1kz5eKVkUNiAw`,
          {
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken:
              'pk.eyJ1Ijoic2t1Y3phZmlrcyIsImEiOiJjbDBuaXlxN3Ewamh0M2tudHU0aG1icGh6In0.XMNMzYQMl1kz5eKVkUNiAw',
          },
        )
        .addTo(map)

      map.on("moveend", () => {
        closeSearchResults()
      })

      getGeoLocation()
    })

    const coords = ref(null)
    const fetchCoords = ref(null)
    const geoMarker = ref(null)
    const geoError = ref(null)
    const geoErrorMsg = ref(null)

    const getGeoLocation = () => {
      if (coords.value) {
        coords.value = null
        sessionStorage.removeItem("coords");
        map.removeLayer(geoMarker.value)
        return;
      }
      // CHECK SESSION STORAGE FOR COORDS

      if (sessionStorage.getItem('coords')) {
        coords.value = JSON.parse(sessionStorage.getItem('coords'))
        plotGeolocation(coords.value)
        return
      }
      fetchCoords.value = true
      navigator.geolocation.getCurrentPosition(setCoords, getLocError)
    }

    const setCoords = (pos) => {
      // STOP FETCHING COORDS

      fetchCoords.value = null

      // SET CORDS IN SESSION STORAGE

      const setSessionCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }

      sessionStorage.setItem('coords', JSON.stringify(setSessionCoords))

      // SET REF COORDS VALUE

      coords.value = setSessionCoords

      plotGeolocation(coords.value)
    }

    const getLocError = (err) => {
      fetchCoords.value = null
      geoError.value = true
      geoErrorMsg.value = err.message
    }

    const plotGeolocation = (coords) => {
      // CREATE CUSTOM MARKER
      const customMarker = leaflet.icon({
        iconUrl: require('../assets/map_pin_red.svg'),
        iconSize: [60, 60],
      })

      // CREATE NEW MARKER WITH COORDS

      geoMarker.value = leaflet
        .marker([coords.lat, coords.lng], { icon: customMarker })
        .addTo(map)

      // SET MAP VIEW TO CURRENT LOCATION
      map.setView([coords.lat, coords.lng], 10)

      closeSearchResults()
    }

    const closeGeoError = () => {
      geoError.value = null
      geoErrorMsg.value = null
    }

    const resultMarker = ref(null)
    
    const plotResult = (coords) => {
      if(resultMarker.value) {
        map.removeLayer(resultMarker.value)
      }

      const customMarker = leaflet.icon({
        iconUrl: require('../assets/map_pin_blue.svg'),
        iconSize: [60, 60],
      })

      // CREATE NEW MARKER WITH COORDS

      resultMarker.value = leaflet
        .marker([coords.coordinates[1], coords.coordinates[0]], { icon: customMarker })
        .addTo(map)

      // SET MAP VIEW TO CURRENT LOCATION
      map.setView([coords.coordinates[1], coords.coordinates[0]], 14)
    }

    const searchResults = ref(null)
    const toggleSearchResults = () => {
      searchResults.value = !searchResults.value
    }

    const closeSearchResults = () => {
      searchResults.value = null
    }

    const removeResult = () => {
      map.removeLayer(resultMarker.value)
    }

    return {
      getGeoLocation,
      coords,
      fetchCoords,
      geoMarker,
      closeGeoError,
      geoError,
      geoErrorMsg,
      plotResult,
      searchResults,
      toggleSearchResults,
      closeSearchResults,
      removeResult,
    }
  }
}
</script>
