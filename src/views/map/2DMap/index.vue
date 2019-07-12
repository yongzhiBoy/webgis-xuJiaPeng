<template>
  <div>
    <div
      id="cesiumContainer"
      class="fullSize"
    />
    <div
      id="menu"
      class="backdrop"
    >
      <span class="demonstration">透明度</span>
      <el-slider
        v-model="alpha"
        :step="0.1"
        :max="1.0"
        show-input
        :show-input-controls="false"
        input-size="mini"
        @change="changeAlpha"
      />

    </div>
  </div>
</template>

<script>
// import building from '@/assets/json/building_shuiAnXingCheng.json'
import grid from '@/assets/json/grid_shuiAnXingCheng.json'
import { Init, addJsonLayer, addKmlLayer } from '../cesium.js'
import 'cesium/Widgets/widgets.css'

import 'element-ui/lib/theme-chalk/index.css'

export default {
  data: function() {
    return {
      viewer: {},
      alpha: 0.3
    }
  },
  watch: {

  },
  mounted() {
    var viewer = Init()
    this.viewer = viewer
    // addJsonLayer(viewer, grid, true, this.alpha)
    addKmlLayer(viewer)
    // this.addJsonLayer(viewer, building, false, this.alpha)
  },
  methods: {
    changeAlpha: function(a) {
      addJsonLayer(this.viewer, grid, true, a)
    }
  }
}
</script>

<style scoped>
#cesiumContainer {
  height: calc(100vh - 50px);
}
.backdrop {
  background: rgba(42, 42, 42, 0.9);
  border-radius: 5px;
  border: 1px solid #444;
  padding: 5px 30px;
  color: #fff;
  margin: 30px;
  line-height: 150%;
  font-size: small;
  width: 60%;
}
#menu {
  position: absolute;
  left: 2%;
  top: 2%;
}
</style>
