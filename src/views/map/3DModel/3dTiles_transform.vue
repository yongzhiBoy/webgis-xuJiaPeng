<!--  -->
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
      <span class="demonstration">高程(meters)</span>
      <el-slider
        v-model="height"
        :step="5"
        :min="-1000"
        :max="1000"
        show-input
        :show-input-controls="false"
        input-size="mini"
        @input="changeHeight"
      />
      <span class="demonstration">经度(radians)</span>
      <el-slider
        v-model="longitude"
        :step="0.0001"
        :min="-0.001"
        :max="0.001"
        show-input
        :show-input-controls="false"
        input-size="mini"
        @input="adjustLongitude"
      />
      <span class="demonstration">纬度(radians)</span>
      <el-slider
        v-model="latitude"
        :step="0.00001"
        :min="-0.001"
        :max="0.001"
        show-input
        :show-input-controls="false"
        input-size="mini"
        @input="ajustLatitude"
      />
      <span class="demonstration">沿X轴旋转(degrees)</span>
      <el-slider
        v-model="xRotation"
        :step="1"
        :min="-360"
        :max="360"
        show-input
        :show-input-controls="false"
        input-size="mini"
        @input="rotateX"
      />
      <span class="demonstration">沿Y轴旋转(degrees)</span>
      <el-slider
        v-model="yRotation"
        :step="1"
        :min="-360"
        :max="360"
        show-input
        :show-input-controls="false"
        input-size="mini"
        @input="rotateY"
      />
      <span class="demonstration">沿Z轴旋转(degrees)</span>
      <el-slider
        v-model="zRotation"
        :step="1"
        :min="-360"
        :max="360"
        show-input
        :show-input-controls="false"
        input-size="mini"
        @input="rotateZ"
      />
    </div>
  </div>
</template>

<script>
import Cesium from 'cesium/Cesium'
import { Init, add3dTiles, adjust3dTilesPosition, rotate } from '../cesium.js'
import 'cesium/Widgets/widgets.css'
import 'element-ui/lib/theme-chalk/index.css'

export default {

  // import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    // 这里存放数据
    return {
      viewer: {},
      tileset: {},
      height: 0,
      longitude: 0,
      latitude: 0,
      xRotation: 0,
      yRotation: 0,
      zRotation: 0,
      initCartographic: {},
      mat: Cesium.Matrix4.IDENTITY
    }
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {

  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {

  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    var viewer = Init()
    this.viewer = viewer
    var tileset = add3dTiles(viewer)
    var _this = this
    tileset.readyPromise.then(function() {
      viewer.zoomTo(
        tileset,
        new Cesium.HeadingPitchRange(
          0.5,
          -0.2,
          tileset.boundingSphere.radius * 4.0
        )
      )
      _this.tileset = tileset
      _this.initCartographic = Cesium.Cartographic.fromCartesian(
        tileset.boundingSphere.center
      )
      _this.mat = Cesium.Matrix4.fromArray(tileset._root.transform)
    })
  },
  // 方法集合
  methods: {
    changeHeight: function(h) {
      adjust3dTilesPosition(this.tileset, this.initCartographic, this.longitude, this.latitude, h)
    },
    adjustLongitude: function(long) {
      adjust3dTilesPosition(this.tileset, this.initCartographic, long, this.latitude, this.height)
    },
    ajustLatitude: function(lat) {
      adjust3dTilesPosition(this.tileset, this.initCartographic, this.longitude, lat, this.height)
    },
    rotateX: function(x) {
      rotate(this.tileset, this.mat, this.zRotation, this.yRotation, x)
    },
    rotateY: function(y) {
      rotate(this.tileset, this.mat, this.zRotation, y, this.xRotation)
    },
    rotateZ: function(z) {
      rotate(this.tileset, this.mat, z, this.yRotation, this.xRotation)
    }

  }
}
</script>

<style lang='scss' scoped>
#cesiumContainer {
  height: calc(100vh - 50px);
}
.backdrop {
  background: rgba(42, 42, 42, 0.9);
  border-radius: 5px;
  border: 1px solid #444;
  padding: 5px 30px;
  color: #fff;
  margin: 5px;
  line-height: 150%;
  font-size: small;
  width: 35%;
}
#menu {
  position: absolute;
  left: 1%;
  top: 1%;
}
</style>
