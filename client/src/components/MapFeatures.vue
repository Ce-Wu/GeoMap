<template>
  <div
    class="w-full md:w-auto absolute md:top[40px] md:left-[60px] z-[2] flex gap-4 px-6 py-8 md:px-0 md:py-0 bg-transparent"
  >
    <!-- SEARCH -->
    <div class="relative flex-1 md:min-w-[350px]">
      <!-- INPUT -->
      <input
        class="pl-9 pr-4 py-3 text-sm w-full shadow-md rounded-md"
        type="text"
        placeholder="Search your location"
        v-model="searchQuery"
        @input="search"
        @focus="$emit('toggleSearchResults')"
      />
      <!-- SEARCH ICON -->
      <div class="absolute top-0 left-[8px] h-full flex items-center">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <!-- SEARCH RESULTS -->
      <div class="absolute mt-2 w-full">
        <!-- RESULTS -->
        <div
          v-if="searchQuery && searchResults"
          class="h-[200px] overflow-scroll bg-white rounded-md"
        >
          <!-- LOADING -->
          <LoadingData v-if="!searchData" />
          <div v-else>
            <div
              v-for="(result, index) in searchData"
              :key="index"
              @click="selectResult(result)"
              class="px-4 py-2 flex gap-x-2 cursor-pointer hover:bg-black hover:text-white"
            >
              <i class="fa-solid fa-location-dot"></i>
              <p class="text-xs">{{ result.place_name }}</p>
            </div>
          </div>
        </div>
        <!-- SELECTED RESULT -->
        <div v-if="selectedResult" class="mt-2 px-4 py-3 bg-white rounded-md">
          <i
            @click="removeResult"
            class="fa-solid fa-circle-xmark flex justify-end cursor-pointer"
          ></i>
          <h1 class="text-lg">{{ selectedResult.text }}</h1>
          <p class="text-xs mb-1">{{ selectedResult.place_name }}</p>
          <p class="text-xs">{{ selectedResult.properties.category }}</p>
        </div>
      </div>
    </div>
    <!-- GEOLOCATION BUTTON -->
    <div
      class="px-4 bg-white flex items-center shadow-md rounded-md min-h-[45px]"
      :class="{ 'bg-slate-600': coords }"
      @click="$emit('getGeoLocation')"
    >
      <i
        class="fa-solid fa-location-crosshairs text-state-600 text-[18px]"
        :class="{ 'text-white': coords, 'animate-pulse': fetchCoords }"
      ></i>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import LoadingData from './LoadingData.vue'
export default {
  props: ['coords', 'fetchCoords', 'searchResults'],
  components: { LoadingData },
  setup(props, { emit }) {
    const searchQuery = ref(null)
    const searchData = ref(null)
    const queryTimeout = ref(null)
    const selectedResult = ref(null)

    const search = () => {
      clearTimeout(queryTimeout.value)

      searchData.value = null
      queryTimeout.value = setTimeout(async () => {
        if (searchQuery.value !== '') {
          const params = new URLSearchParams({
            fuzzyMatch: true,
            language: 'pl',
            limit: 10,
            proximity: props.coords
              ? `${props.coords.lng},${props.coords.lat}`
              : '0,0',
          })
          const getData = await axios.get(
            `api/search/${searchQuery.value}?${params}`,
          )
          searchData.value = getData.data.features
        }
      }, 750)
    }

    const selectResult = (result) => {
      selectedResult.value = result
      emit('plotResult', result.geometry)
    }

    const removeResult = () => {
      selectedResult.value = null
      emit('removeResult')
    }

    return {
      removeResult,
      selectResult,
      selectedResult,
      searchQuery,
      searchData,
      queryTimeout,
      search,
    }
  },
}
</script>
