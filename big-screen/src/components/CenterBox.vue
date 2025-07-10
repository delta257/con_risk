<template>
  <div class="centerBox">
    <dv-border-box-8>
      <div class="bg">
        <div id="worldMap" ref="worldMapRef"></div>
        <!-- <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6468124.418314829!2d95.19933275325296!3d19.71986596598296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x305652a7714e2907%3A0xba7b0ee41c622b11!2z57yF55S4!5e0!3m2!1szh-CN!2shk!4v1716371745872!5m2!1szh-CN!2shk"
          width="100%"
          height="1000"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe> -->
      </div>
    </dv-border-box-8>
  </div>
</template>

<script>
import * as echarts from "echarts";
import worldJson from "../lib/world.json";
// import myanmarJson from "../lib/sss.json";
// import myanmarJson from "../lib/MM.json";
import myanmarJson from "../lib/myanmar.json";
import mekongJson from "../lib/mekong.json";
import mekongStations from "../lib/mekong_stations.json";
import chinaProjects from "../lib/china_projects.json";
// import "../lib/Myanmar.js";
import { initMap, darkStyle } from "../utils/mapvglCommon";
import coordtransform from 'coordtransform';
export default {
  name: "CenterBox",
  props: {
    country: {
      type: String,
      required: false,
      default: 'myanmar',
    },
  },
  data() {
    return {
      // chart: null,
      map: null,
    };
  },
  mounted() {
    // this.initWorldMap();
    this.initBaiduMap();
  },
  methods: {
    // initWorldMap() {
    //   // echarts.registerMap("Myanmar", myanmarJson);
    //   echarts.registerMap("worldJson", worldJson);
    //   this.chart = echarts.init(this.$refs.worldMapRef);
    //   const option = {
    //     geo: {
    //       type: "map",
    //       // map: "Myanmar",
    //       map: "worldJson",
    //       zoom: 5, //地图的缩放
    //       label: {
    //         emphasis: {
    //           show: true,
    //           color: "#fff",
    //         },
    //       },
    //       // nameMap: {
    //       //   Myanmar: "缅甸",
    //       //   China: "中国",
    //       // },
    //       roam: true, //是否滚动缩放
    //       // center: [96.2067, 19.7361],
    //       // center: [115.97, 29.71],
    //       regions: [
    //         // {
    //         //   name: "Myanmar", //这个名字可以是map（世界地图），China（中国地图高亮）
    //         //   itemStyle: {
    //         //     normal: {
    //         //       areaColor: "#480103",
    //         //       borderColor: "#ffc107",
    //         //       borderWidth: 1,
    //         //     },
    //         //     emphasis: {
    //         //       areaColor: "#b40106",
    //         //     },
    //         //   },
    //         // },
    //       ],
    //       // itemStyle: {
    //       //   normal: {
    //       //     areaColor: "#690613",
    //       //     borderColor: "rgba(255,255,255,0.6)", //国界线颜色
    //       //     borderType: "dotted", //国界线类型
    //       //   },
    //       //   emphasis: {
    //       //     areaColor: "#ad9541",
    //       //   },
    //       // },
    //     },
    //     series: [
    //       {
    //         type: "map",
    //         map: "worldJson", // 设置地图类型
    //         label: {
    //           show: true, // 显示城市名称
    //         },
    //         // center: [96.2067, 19.7361], // 地图中心点 内比都,
    //         // center: [115.97, 29.71], // 地图中心点 内比都,
    //         data: [
    //           // 示例数据，包含城市名和经纬度
    //           { name: "New York", value: [-74.006, 40.7128] },
    //           // { name: "Myanmar", value: [-0.093, 51.5085] },
    //           // ... 添加更多城市
    //         ],
    //       },
    //     ],
    //   };
    //   this.chart.setOption(option);
    //   // window.addEventListener("resize", function () {
    //   //   this.chart.resize();
    //   // });
    // },
    initBaiduMap() {
      const map = initMap("worldMap", {
        tilt: 30,
        heading: 0,
        // center: [109.792816, 27.702774],
        center: [96.2067, 19.7361],
        zoom: 7,
        style: darkStyle,
      });
      this.map = map;
      const colorBand = ["rgba(90, 90, 102, 0.27)", "cadetblue", "orange", "red", "tan"];
      const gParse = new BMapGL.GeoJSONParse({
        reference: "GCJ02",
      });
      // 去除缅甸区域颜色填充，不再添加Prism覆盖物
      // gParse.readFeaturesFromObject(myanmarJson, { isPoints: true }, function (overlay) {
      //   const index = overlay.properties.join || 0;
      //   const prism = new BMapGL.Prism(overlay.points, 3000, {
      //     topFillColor: colorBand[index],
      //     topFillOpacity: 0.9,
      //     sideFillColor: colorBand[index],
      //     sideFillOpacity: 0.9,
      //   });
      //   prism.properties = overlay.properties;
      //   prism.setZIndex(-1);
      //   // 监听点击事件
      //   prism.addEventListener("click", function (e) {
      //     // 这里可以自定义后续逻辑，比如弹窗、状态更新等
      //     // 示例：弹窗显示国家名
      //     const countryName = prism.properties.Name || "缅甸";
      //     alert(`点击了国家：${countryName}`);
      //     // TODO: 可以在这里派发事件或调用父组件方法
      //   });
      //   map.addOverlay(prism);
      // });
      const view = new mapvgl.View({
        map: map,
      });
      const textLayer = new mapvgl.TextLayer({
        // fontFamily: 'Songti SC',
        enablePicked: true,
        autoSelect: true,
        selectedColor: "#f00", // 选中项颜色
        color: "#fff",
        lineWidth: 3, // 文字粗细，在设置描边时才有效
        textMaxWidth: 80, // 文字最大宽度，超过则换行
        textMaxHeight: 50,
        textAlign: "center", // 文字对齐方式，支持'center'、'left'
        lineHeight: 24,
        // shadow: {
        //     color: 'rgba(0, 250, 0, 1)',
        //     blur: 6,
        //     offsetX: 3,
        //     offsetY: 3
        // },
        stroke: {
          color: "#000",
        },
        // collides: false
        // flat: true
      });
      view.addLayer(textLayer);
      textLayer.setData([]);

      // 删除内比都、万象的marker、label、弹窗、circle和折线

      // 1. 缅甸Polygon
      const myanmarCoords = myanmarJson.features[0].geometry.coordinates[0];
      const myanmarPoints = myanmarCoords.map(coord => new BMapGL.Point(coord[0], coord[1]));
      const myanmarPolygon = new BMapGL.Polygon(myanmarPoints, {
        strokeColor: "transparent",
        fillColor: "transparent",
        strokeWeight: 0,
        fillOpacity: 0
      });
      myanmarPolygon.setZIndex(1);
      myanmarPolygon.addEventListener('click', (e) => {
        this.$emit('country-changed', 'myanmar');
        if (this.map) {
          this.map.centerAndZoom(new BMapGL.Point(96.2067, 19.7361), 7);
        }
      });
      map.addOverlay(myanmarPolygon);

      // 2. 老挝Polygon
      const laosFeature = worldJson.features.find(f =>
        f.properties && (
          f.properties.name === 'Laos' ||
          f.properties.name === 'LAO' ||
          f.properties.name === 'Lao PDR' ||
          f.properties.NAME === 'Laos' ||
          f.properties.NAME === 'LAO' ||
          f.properties.NAME === 'Lao PDR'
        )
      );
      if (laosFeature) {
        const coordsArr = laosFeature.geometry.coordinates;
        const polygons = (laosFeature.geometry.type === 'Polygon')
          ? [coordsArr]
          : coordsArr;
        polygons.forEach(ringArr => {
          ringArr.forEach(ring => {
            const laosPoints = ring.map(coord => new BMapGL.Point(coord[0], coord[1]));
            const laosPolygon = new BMapGL.Polygon(laosPoints, {
              strokeColor: "transparent",
              fillColor: "transparent",
              strokeWeight: 0,
              fillOpacity: 0
            });
            laosPolygon.setZIndex(1);
            laosPolygon.addEventListener('click', (e) => {
              this.$emit('country-changed', 'laos');
              if (this.map) {
                this.map.centerAndZoom(new BMapGL.Point(102.6341, 17.9757), 7);
              }
            });
            map.addOverlay(laosPolygon);
          });
        });
      }
      // 渲染湄公河（Mekong）
      try {
        const mekongFeature = mekongJson.features.find(f => f.properties && (f.properties.name === 'Mekong' || f.properties.name_zh === '湄公河'));
        if (mekongFeature && mekongFeature.geometry && mekongFeature.geometry.type === 'LineString') {
          const coords = mekongFeature.geometry.coordinates;
          // WGS84 -> GCJ02 -> BD09（百度坐标）
          const points = coords.map(coord => {
            const gcj = coordtransform.wgs84togcj02(coord[0], coord[1]);
            const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
            return new BMapGL.Point(bd09[0], bd09[1]);
          });
          const mekongLine = new BMapGL.Polyline(points, {
            strokeColor: 'rgba(18, 77, 241, 1)',
            strokeWeight: 6,
            strokeOpacity: 1,
          });
          map.addOverlay(mekongLine);
        }
      } catch (e) {
        console.error('湄公河渲染失败', e);
      }
      // 湄公河站点标记
      if (Array.isArray(mekongStations)) {
        mekongStations.forEach(station => {
          // 直接用WGS84转BD09，保证和河流一致
          const gcj = coordtransform.wgs84togcj02(station.lng, station.lat);
          const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
          const point = new BMapGL.Point(bd09[0], bd09[1]);
          // Marker
          const marker = new BMapGL.Marker(point);
          map.addOverlay(marker);
          // Label
          const label = new BMapGL.Label(station.name, {
            position: point,
            offset: new BMapGL.Size(10, -24)
          });
          label.setStyle({
            color: '#fff',
            background: 'rgba(33,150,243,0.85)',
            border: '1px solid #2196f3',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          });
          map.addOverlay(label);
        });
      }
      // 涉中项目标记
      if (Array.isArray(chinaProjects)) {
        chinaProjects.forEach(proj => {
          const gcj = coordtransform.wgs84togcj02(proj.lng, proj.lat);
          const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
          const point = new BMapGL.Point(bd09[0], bd09[1]);
          // Marker
          const marker = new BMapGL.Marker(point);
          map.addOverlay(marker);
          // Label
          const label = new BMapGL.Label(proj.name, {
            position: point,
            offset: new BMapGL.Size(10, -24)
          });
          label.setStyle({
            color: '#fff',
            background: 'rgba(255,87,34,0.9)',
            border: '1px solid #ff5722',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          });
          map.addOverlay(label);
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.centerBox {
  // padding: 20px 10px;
  .bg {
    height: calc(100vh - 40px);
    border-radius: 30px;
    #worldMap {
      width: 100%;
      height: calc(100vh - 40px);
      border-radius: 30px;
    }
  }
}
</style>
