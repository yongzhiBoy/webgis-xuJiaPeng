import Cesium from 'cesium/Cesium'

// 初始化一个viewer
const Init = function() {
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYzVmODUzMy03ZjZjLTQzMmQtYjlmZC1lZjBkYzgzYjc3NTciLCJpZCI6NDUzMiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0MTA1NzA3MX0.LtxiUHHxAsLj-PR9VCn-sCRaej5Lt2XN2pWPJcWTW5U'
  var viewer = new Cesium.Viewer('cesiumContainer', {
    // load Cesium World Terrain
    terrainProvider: Cesium.createWorldTerrain({
      requestWaterMask: true, // required for water effects
      requestVertexNormals: true // required for terrain lighting
    }),
    infoBox: true, // infobox小部件，点击显示属性信息
    fullscreenButton: true, // viewer全屏显示
    baseLayerPicker: true, // 底图选择部件
    sceneModePicker: false, // 在3D，2D和哥伦布视图（CV）模式之间切换。
    homeButton: false, // 默认视图回正
    geocoder: false, // 位置搜索工具
    navigationHelpButton: false, // 默认相机控件
    // CreditsDisplay: false,// 显示数据信息
    animation: false, // 视图动画控制
    timeline: false, // 时间轴
    selectionIndicator: false
  })
  // Enable depth testing so things behind the terrain disappear.
  viewer.scene.globe.depthTestAgainstTerrain = true
  // viewer.extend(Cesium.viewerCesiumInspectorMixin)

  return viewer
  // addJsonLayer(viewer, jsonData)
}

// 加载 3dTiles 模型
function add3dTiles(viewer) {
  var tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      // url: 'http://202.114.148.160/Tilesets/osgb/tileset.json',
      url: 'http://202.114.148.160/sogbTo3dtiles/DongJiaCun/tileset.json',
      // url:'http://202.114.148.160/sogbTo3dtiles/GuanBaHe/tileset.json',
      // url:'http://202.114.148.160/Tilesets/BatchedSHY/tileset.json',
      show: true,
      modelMatrix: Cesium.Matrix4.IDENTITY
    })
  )

  // tileset.readyPromise.then(function() {
  //   viewer.zoomTo(
  //     tileset,
  //     new Cesium.HeadingPitchRange(
  //       0.5,
  //       -0.2,
  //       tileset.boundingSphere.radius * 4.0
  //     )
  //   )
  // })

  return tileset
}

// 平移调整 3dtiles模型的位置
function adjust3dTilesPosition(
  tileset,
  initCartographic,
  longitude,
  latitude,
  height
) {
  if (!initCartographic.longitude) {
    return
  }
  var long = initCartographic.longitude + longitude
  var lat = initCartographic.latitude + latitude
  var h = initCartographic.height + height
  var surface = Cesium.Cartesian3.fromRadians(
    initCartographic.longitude,
    initCartographic.latitude,
    initCartographic.height
  )
  var offset = Cesium.Cartesian3.fromRadians(long, lat, h)
  var translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3()
  )
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
}

// headingPitchRoll;旋转 3dTiles模型
function rotate(tileset, tranformMatrix4, heading, pitch, roll) {
  if (!tileset._root) {
    return
  }
  var a = tranformMatrix4
  var s = Cesium.Matrix4.getTranslation(a, new Cesium.Cartesian3())
  var _s = Cesium.Transforms.eastNorthUpToFixedFrame(s)
  var angle = Cesium.Matrix3.fromHeadingPitchRoll(
    Cesium.HeadingPitchRoll.fromDegrees(heading, pitch, roll)
  )
  var modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
    _s,
    angle,
    new Cesium.Matrix4()
  )
  tileset._root.transform = modelMatrix
}

// 加载json数据并修改其属性样式
function addJsonLayer(viewer, jsonData, colorMaker, EntityColor) {
  viewer.dataSources.removeAll()
  var geojsonOptions = {
    clampToGround: true
  }

  var dataSourcePromise = Cesium.GeoJsonDataSource.load(
    jsonData,
    geojsonOptions
  )

  dataSourcePromise.then(function(dataSource) {
    // Add the new data as entities to the viewer
    viewer.dataSources.add(dataSource)

    // Get the array of entities
    var entityArray = dataSource.entities.values
    for (var i = 0; i < entityArray.length; i++) {
      var entity = entityArray[i]

      if (Cesium.defined(entity.polygon)) {
        // Use geojson properties value as entity name
        entity.name = entity.properties.grid_name

        if (colorMaker) {
          jsonColor(entity, EntityColor)
        }

        // Generate Polygon position
        var polyPositions = entity.polygon.hierarchy.getValue(
          Cesium.JulianDate.now()
        ).positions
        var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter)
        entity.position = polyCenter

        // Generate labels
        entity.label = {
          text: entity.name,
          showBackground: true,
          scale: 0.5,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            100.0,
            2000000.0
          ),
          disableDepthTestDistance: 10000.0
        }
      }
    }
    viewer.zoomTo(dataSource)
  })
}

function jsonColor(entity, alpha) {
  // Set the polygon material to a color.
  entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.SKYBLUE, alpha)
}

function addKmlLayer(viewer, data) {
  var kmlOptions = {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true
  }

  var geocachePromise = Cesium.KmlDataSource.load(
    'http://202.114.148.160/workspace/xjpStreet.kml',
    kmlOptions
  )

  // Add entities to scene and style them
  geocachePromise.then(function(dataSource) {
    // Add the new data as entities to the viewer
    viewer.dataSources.add(dataSource)

    // Get the array of entities
    var geocacheEntities = dataSource.entities.values
    var kmlEntitys = geocacheEntities[0]
    var entitys = kmlEntitys._children
    for (var i = 0; i < entitys.length; i++) {
      var entity = entitys[i]._children[0]
      if (Cesium.defined(entity.polygon)) {
        // Entity styling code here
        // Generate labels
        // entity.name = 'ee'

        // Generate Polygon position
        var polyPositions = entity.polygon.hierarchy.getValue(
          Cesium.JulianDate.now()
        ).positions
        var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter)
        entity.position = polyCenter

        entity.label = {
          text: entity.name,
          showBackground: true,
          scale: 0.5,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            100.0,
            2000000.0
          ),
          disableDepthTestDistance: 10000.0
        }
      }
    }
    viewer.zoomTo(dataSource)
  })
}

export {
  Init,
  addJsonLayer,
  addKmlLayer,
  add3dTiles,
  adjust3dTilesPosition,
  rotate
}
