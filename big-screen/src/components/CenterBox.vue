<template>
  <div class="centerBox">
    <dv-border-box-8>
      <div class="bg">
        <div class="map-btn-container">
          <button :class="{ 'selected-button': showPorts }" @click="togglePorts">主要交通节点/要道</button>
          <button :class="{ 'selected-button': showCheckpoints }" @click="toggleCheckpoints">湄公河沿岸检查站</button>
          <button :class="{ 'selected-button': showArmedGroups }" @click="toggleArmedGroups">武装组织活动区域</button>
          <button :class="{ 'selected-button': showChinaProjects }" @click="toggleChinaProjects">中国在地关键项目</button>
          <button @click="showAIDialog = true">AI对话</button>
        </div>
        <div id="worldMap" ref="worldMapRef"></div>
        <div v-if="popupVisible" class="map-popup">
          <div class="popup-title">{{ popupData.name }}</div>
          <img v-if="popupData.img" :src="popupData.img" class="popup-img" />
          <div class="popup-desc" v-html="popupData.desc"></div>
          <span class="popup-close" @click="popupVisible = false">×</span>
        </div>
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
    <AIDialog v-model="showAIDialog" />
  </div>
</template>

<script>
import * as echarts from "echarts";
import worldJson from "../lib/world.json";
// import myanmarJson from "../lib/sss.json";
// import myanmarJson from "../lib/MM.json";
import myanmarJson from "../lib/myanmar.json";
import mekongJson from "../lib/mekong.json";
import laosPorts from "../lib/laos_ports.json";
import myanmarPorts from "../lib/myanmar_ports.json";
import mekongCheckpoints from "../lib/mekong_checkpoints.json";
import chinaMyanmarProjects from "../lib/china_myanmar_projects.json";
import chinaLaosProjects from "../lib/china_laos_projects.json";
import mekongArmedGroups from "../lib/mekong_armed_groups.json";
import mekongArmedGroupsLaos from "../lib/mekong_armed_groups_laos.json";
// import "../lib/Myanmar.js";
import { initMap, darkStyle } from "../utils/mapvglCommon";
import coordtransform from 'coordtransform';
import AIDialog from './AIDialog.vue';
export default {
  name: "CenterBox",
  props: {
    country: {
      type: String,
      required: false,
      default: 'myanmar',
    },
  },
  components: {
    AIDialog,
  },
  data() {
    return {
      // chart: null,
      map: null,
      overlays: {
        ports: [],
        checkpoints: [],
        chinaProjects: [],
        armedGroups: [],
      },
      showPorts: false,
      showCheckpoints: false,
      showChinaProjects: false,
      showArmedGroups: false,
      currentCountry: 'myanmar',
      popupVisible: false, // 新增
      popupData: { name: '', desc: '', img: '' }, // 新增
      popupPosition: { x: 0, y: 0 }, // 新增
      showAIDialog: false,
    };
  },
  watch: {
    country(newVal, oldVal) {
      this.currentCountry = newVal;
      this.clearAllOverlays();
      this.showPorts = false;
      this.showCheckpoints = false;
      this.showChinaProjects = false;
      this.showArmedGroups = false;
    }
  },
  mounted() {
    // this.initWorldMap();
    this.initBaiduMap();
  },
  methods: {
    clearAllOverlays() {
      Object.values(this.overlays).forEach(arr => {
        arr.forEach(o => this.map && this.map.removeOverlay(o));
      });
      this.overlays.ports = [];
      this.overlays.checkpoints = [];
      this.overlays.chinaProjects = [];
      this.overlays.armedGroups = [];
    },
    togglePorts() {
      this.showPorts = !this.showPorts;
      this.clearOverlays('ports');
      if (this.showPorts) this.renderPorts();
    },
    toggleCheckpoints() {
      this.showCheckpoints = !this.showCheckpoints;
      this.clearOverlays('checkpoints');
      if (this.showCheckpoints) this.renderCheckpoints();
    },
    toggleChinaProjects() {
      this.showChinaProjects = !this.showChinaProjects;
      this.clearOverlays('chinaProjects');
      if (this.showChinaProjects) this.renderChinaProjects();
    },
    toggleArmedGroups() {
      this.showArmedGroups = !this.showArmedGroups;
      this.clearOverlays('armedGroups');
      if (this.showArmedGroups) this.renderArmedGroups();
    },
    clearOverlays(type) {
      this.overlays[type].forEach(o => this.map && this.map.removeOverlay(o));
      this.overlays[type] = [];
    },
    renderPorts() {
      const arr = [];
      let portData = [];
      if (this.currentCountry === 'myanmar') {
        portData = myanmarPorts;
      } else if (this.currentCountry === 'laos') {
        portData = laosPorts;
      }
      portData.forEach(port => {
        const gcj = coordtransform.wgs84togcj02(port.lng, port.lat);
        const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
        const point = new BMapGL.Point(bd09[0], bd09[1]);
        const marker = new BMapGL.Marker(point);
        arr.push(marker);
        this.map.addOverlay(marker);
        const label = new BMapGL.Label(port.name, {
          position: point,
          offset: new BMapGL.Size(10, -24)
        });
        label.setStyle({
          color: '#fff',
          background: this.currentCountry === 'myanmar' ? 'rgba(14, 71, 177, 0.9)' : 'rgba(0, 153, 102, 0.9)',
          border: this.currentCountry === 'myanmar' ? '1px solid rgb(14, 71, 177)' : '1px solid #009966',
          borderRadius: '6px',
          padding: '2px 8px',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        });
        // 移除label.setTitle
        marker.addEventListener('click', (e) => {
          this.showPopup({ name: port.name, desc: port.desc, img: port.img }, e);
        });
        label.addEventListener('click', (e) => {
          this.showPopup({ name: port.name, desc: port.desc, img: port.img }, e);
        });
        arr.push(label);
        this.map.addOverlay(label);
      });
      this.overlays.ports = arr;
    },
    renderCheckpoints() {
      const arr = [];
      mekongCheckpoints.forEach(pointData => {
        const gcj = coordtransform.wgs84togcj02(pointData.lng, pointData.lat);
        const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
        const point = new BMapGL.Point(bd09[0], bd09[1]);
        const marker = new BMapGL.Marker(point);
        arr.push(marker);
        this.map.addOverlay(marker);
        const label = new BMapGL.Label(`${pointData.name}（${pointData.type}）`, {
          position: point,
          offset: new BMapGL.Size(10, -24)
        });
        label.setStyle({
          color: '#fff',
          background: 'rgba(33,150,243,0.95)',
          border: '1px solid #2196f3',
          borderRadius: '6px',
          padding: '2px 8px',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        });
        // 移除label.setTitle
        marker.addEventListener('click', (e) => {
          this.showPopup({ name: pointData.name, desc: pointData.desc, img: pointData.img }, e);
        });
        label.addEventListener('click', (e) => {
          this.showPopup({ name: pointData.name, desc: pointData.desc, img: pointData.img }, e);
        });
        arr.push(label);
        this.map.addOverlay(label);
      });
      this.overlays.checkpoints = arr;
    },
    renderChinaProjects() {
      const arr = [];
      if (this.currentCountry === 'myanmar') {
        chinaMyanmarProjects.forEach(proj => {
          const gcj = coordtransform.wgs84togcj02(proj.lng, proj.lat);
          const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
          const point = new BMapGL.Point(bd09[0], bd09[1]);
          const marker = new BMapGL.Marker(point);
          arr.push(marker);
          this.map.addOverlay(marker);
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
          // 移除label.setTitle
          marker.addEventListener('click', (e) => {
            this.showPopup({ name: proj.name, desc: proj.desc, img: proj.img }, e);
          });
          label.addEventListener('click', (e) => {
            this.showPopup({ name: proj.name, desc: proj.desc, img: proj.img }, e);
          });
          arr.push(label);
          this.map.addOverlay(label);
        });
      } else if (this.currentCountry === 'laos') {
        chinaLaosProjects.forEach(proj => {
          if (proj.lat && proj.lng) {
            const gcj = coordtransform.wgs84togcj02(proj.lng, proj.lat);
            const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
            const point = new BMapGL.Point(bd09[0], bd09[1]);
            const marker = new BMapGL.Marker(point);
            arr.push(marker);
            this.map.addOverlay(marker);
            const label = new BMapGL.Label(proj.name, {
              position: point,
              offset: new BMapGL.Size(10, -24)
            });
            label.setStyle({
              color: '#fff',
              background: 'rgba(76,175,80,0.9)',
              border: '1px solid #4caf50',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            });
            // 移除label.setTitle
            marker.addEventListener('click', (e) => {
              this.showPopup({ name: proj.name, desc: proj.desc, img: proj.img }, e);
            });
            label.addEventListener('click', (e) => {
              this.showPopup({ name: proj.name, desc: proj.desc, img: proj.img }, e);
            });
            arr.push(label);
            this.map.addOverlay(label);
          }
        });
      }
      this.overlays.chinaProjects = arr;
    },
    renderArmedGroups() {
      const arr = [];
      if (this.currentCountry === 'myanmar') {
        mekongArmedGroups.forEach(group => {
          const gcj = coordtransform.wgs84togcj02(group.lng, group.lat);
          const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
          const point = new BMapGL.Point(bd09[0], bd09[1]);
          const circle = new BMapGL.Circle(point, 20000, {
            strokeColor: 'rgba(218,29,139,0.8)',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: 'rgba(218,29,139,0.3)',
            fillOpacity: 0.3
          });
          arr.push(circle);
          this.map.addOverlay(circle);
          const label = new BMapGL.Label(group.name, {
            position: point,
            offset: new BMapGL.Size(10, -24)
          });
          label.setStyle({
            color: '#fff',
            background: 'rgba(218,29,139,0.9)',
            border: '1px solid rgba(218,29,139,0.9)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          });
          // 移除label.setTitle
          const marker = new BMapGL.Marker(point);
          marker.addEventListener('click', (e) => {
            this.showPopup({ name: group.name, desc: group.goal, img: group.img }, e);
          });
          label.addEventListener('click', (e) => {
            this.showPopup({ name: group.name, desc: group.goal, img: group.img }, e);
          });
          arr.push(label);
          this.map.addOverlay(label);
        });
      } else if (this.currentCountry === 'laos') {
        mekongArmedGroupsLaos.forEach(group => {
          const gcj = coordtransform.wgs84togcj02(group.lng, group.lat);
          const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
          const point = new BMapGL.Point(bd09[0], bd09[1]);
          const circle = new BMapGL.Circle(point, 20000, {
            strokeColor: 'rgba(120,29,218,0.8)',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: 'rgba(120,29,218,0.3)',
            fillOpacity: 0.3
          });
          arr.push(circle);
          this.map.addOverlay(circle);
          const label = new BMapGL.Label(group.name, {
            position: point,
            offset: new BMapGL.Size(10, -24)
          });
          label.setStyle({
            color: '#fff',
            background: 'rgba(120,29,218,0.9)',
            border: '1px solid rgba(120,29,218,0.9)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          });
          // 移除label.setTitle
          const marker = new BMapGL.Marker(point);
          marker.addEventListener('click', (e) => {
            this.showPopup({ name: group.name, desc: group.goal, img: group.img }, e);
          });
          label.addEventListener('click', (e) => {
            this.showPopup({ name: group.name, desc: group.goal, img: group.img }, e);
          });
          arr.push(label);
          this.map.addOverlay(label);
        });
      }
      this.overlays.armedGroups = arr;
    },
    showPopup(data, e) {
      this.popupData = data;
      let x = e.domEvent ? e.domEvent.clientX : 0;
      let y = e.domEvent ? e.domEvent.clientY : 0;
      this.popupPosition = { x, y };
      this.popupVisible = true;
    },
    initBaiduMap() {
      const map = initMap("worldMap", {
        tilt: 30,
        heading: 0,
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
      // 湄公河动画河流
      try {
        const mekongFeature = mekongJson.features.find(f => f.properties && (f.properties.name === 'Mekong' || f.properties.name_zh === '湄公河'));
        if (mekongFeature && mekongFeature.geometry && mekongFeature.geometry.type === 'LineString') {
          const coords = mekongFeature.geometry.coordinates;
          // WGS84 -> GCJ02 -> BD09（百度坐标）
          const points = coords.map(coord => {
            const gcj = coordtransform.wgs84togcj02(coord[0], coord[1]);
            const bd09 = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
            return [bd09[0], bd09[1]];
          });
          // 使用 mapvgl.LineLayer 实现动画河流
          const view = new mapvgl.View({ map });
          const lineLayer = new mapvgl.LineLayer({
            color: 'rgba(44, 195, 233, 0.9)',
            width: 12,
            blend: 'lighter',
            dashArray: [1, 1],
            dashOffset: 0,
            animation: true,
            animationDuration: 1.5,
            animationRepeat: true,
            animationInterval: 0.5,
            animationType: 'flow',
            animationColor: 'rgba(0,234,255,1)',
            animationRepeatType: 'loop',
            animationDashArray: [1, 1],
            animationDashOffset: 0,
          });
          view.addLayer(lineLayer);
          lineLayer.setData([
            {
              geometry: {
                type: 'LineString',
                coordinates: points
              }
            }
          ]);
        }
      } catch (e) {
        console.error('湄公河动画河流渲染失败', e);
      }
      // 不自动渲染任何覆盖物，全部通过按钮控制
    },
  },
};
</script>

<style lang="less" scoped>
.centerBox {
  overflow: hidden;
  .bg {
    height: calc(100vh - 66px);
    border-radius: 30px;
    overflow: hidden; /* 防止内容溢出 */
    #worldMap {
      width: 100%;
      height: calc(100vh - 40px);
      border-radius: 30px;
      overflow: hidden;
    }
  }
}
.map-btn-container {
  position: absolute;
  left: 50%;
  top: 30px;
  transform: translateX(-50%);
  display: flex;
  z-index: 10;
  width: auto;
  height: auto;
  pointer-events: auto;
  button {
    border: 1px solid lightgray;
    padding: 10px 20px;
    margin: 5px;
    cursor: pointer;
    background-color: transparent;
    transition: background-color 0.3s ease;
    color: rgb(145, 167, 184);
    font-size: 16px;
    border-radius: 6px;
    outline: none;
    box-sizing: border-box;
  }
  .selected-button {
    background: linear-gradient(
      to right,
      rgba(173, 216, 230, 0.6),
      rgba(56, 126, 152, 0.8)
    );
    color: #fff;
    border: 1px solid #3fa7ff;
  }
}
html, body {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
.map-popup {
  position: fixed;
  z-index: 9999;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-block;
  width: auto;
  max-width: 90vw;
  max-height: 80vh;
  background: rgba(255,255,255,0.98);
  color: #222;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  padding: 16px 20px 12px 20px;
  pointer-events: auto;
  white-space: normal;
  overflow-y: auto;
}
.popup-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}
.popup-img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}
.popup-desc {
  font-size: 15px;
  margin-bottom: 8px;
  max-height: 60vh;
  overflow-y: auto;
}
.popup-close {
  position: absolute;
  right: 10px;
  top: 6px;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}
</style>
