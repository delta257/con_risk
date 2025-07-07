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
// import worldJson from "../lib/world.json";
// import myanmarJson from "../lib/sss.json";
// import myanmarJson from "../lib/MM.json";
import myanmarJson from "../lib/myanmar.json";
// import "../lib/Myanmar.js";
import { initMap, darkStyle } from "../utils/mapvglCommon";
export default {
  name: "CenterBox",
  data() {
    return {
      // chart: null,
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
      const colorBand = ["rgb(43,59,76)", "cadetblue", "orange", "red", "tan"];
      const gParse = new BMapGL.GeoJSONParse({
        reference: "GCJ02",
      });
      gParse.readFeaturesFromObject(myanmarJson, { isPoints: true }, function (overlay) {
        const index = overlay.properties.join || 0;
        const prism = new BMapGL.Prism(overlay.points, 3000, {
          topFillColor: colorBand[index],
          topFillOpacity: 0.9,
          sideFillColor: colorBand[index],
          sideFillOpacity: 0.9,
        });
        prism.properties = overlay.properties;
        prism.setZIndex(-1);
        // 监听点击事件
        prism.addEventListener("click", function (e) {
          // 这里可以自定义后续逻辑，比如弹窗、状态更新等
          // 示例：弹窗显示国家名
          const countryName = prism.properties.Name || "缅甸";
          alert(`点击了国家：${countryName}`);
          // TODO: 可以在这里派发事件或调用父组件方法
        });
        map.addOverlay(prism);
      });
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

      const point = new BMapGL.Point(96.2067, 19.7361);
      map.centerAndZoom(point, 7);
      const marker = new BMapGL.Marker(point);
      map.addOverlay(marker);

      const opts = {
        width: 200, // 信息窗口宽度
        height: 100, // 信息窗口高度
        title: "内比都", // 信息窗口标题
        message: "这里是内比都",
      };

      const infoWindow = new BMapGL.InfoWindow(
        "2024年5月14日，缅甸克钦独立军司令康伦中将去世",
        opts
      );

      marker.addEventListener("click", function (e) {
        map.openInfoWindow(infoWindow, point);
      });
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
