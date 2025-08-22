<template>
  <div class="centerBox">
    <dv-border-box-8>
      <div class="bg">
        <!-- 功能按钮容器 - 中上部 -->
        <div class="function-btn-container">
          <div class="btn-row">
            <button :class="{ 'selected-button': showPorts }" @click="togglePorts">主要交通节点/要道</button>
            <button :class="{ 'selected-button': showCheckpoints }" @click="toggleCheckpoints">湄公河沿岸检查站</button>
            <button :class="{ 'selected-button': showArmedGroups }" @click="toggleArmedGroups">武装组织活动区域</button>
            <button :class="{ 'selected-button': showChinaProjects }" @click="toggleChinaProjects">中国在地关键项目</button>
          </div>
        </div>
        
        <!-- 地图样式切换按钮容器 - 底部 -->
        <div class="map-style-btn-container">
          <div class="btn-row">
            <button :class="{ 'selected-button': currentMapType === 'roadmap' }" @click="changeMapType('roadmap')">路线图</button>
            <button :class="{ 'selected-button': currentMapType === 'satellite' }" @click="changeMapType('satellite')">卫星图</button>
            <button :class="{ 'selected-button': currentMapType === 'terrain' }" @click="changeMapType('terrain')">地形图</button>
            <button :class="{ 'selected-button': currentMapType === 'hybrid' }" @click="changeMapType('hybrid')">混合图</button>
            <button :class="{ 'selected-button': showTrafficLayer }" @click="toggleTrafficLayer" :title="'实时交通数据在发达地区更完整'">实时交通</button>
            <button :class="{ 'selected-button': showTransitLayer }" @click="toggleTransitLayer" :title="'公共交通数据主要覆盖发达国家大城市'">公共交通</button>
          </div>
        </div>


        <div id="worldMap" ref="worldMapRef"></div>
        
        <!-- AI助手悬浮窗图标 -->
        <div 
          class="ai-float-button" 
          :class="{ 'active': showAIDialog, 'dragging': isDragging }"
          :style="{ right: aiFloatPosition.x + 'px', top: aiFloatPosition.y + 'px' }"
          @mousedown="startDrag"
          @click="handleClick"
        >
          <div class="ai-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 机器人头部 -->
              <rect x="6" y="6" width="12" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
              <!-- 机器人眼睛 -->
              <circle cx="9" cy="9" r="1" fill="currentColor"/>
              <circle cx="15" cy="9" r="1" fill="currentColor"/>
              <!-- 机器人嘴巴 -->
              <path d="M10 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <!-- 机器人天线 -->
              <path d="M12 6V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="3" r="1" fill="currentColor"/>
              <!-- 机器人身体 -->
              <rect x="8" y="16" width="8" height="4" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
              <!-- 机器人手臂 -->
              <path d="M6 10H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M20 10H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <!-- 机器人腿 -->
              <path d="M10 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M14 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="ai-tooltip">{{'AI智能助手'}}</div>
        </div>

      </div>
    </dv-border-box-8>
    <AIDialog v-model="showAIDialog" />
  </div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';
import worldJson from "../lib/world.json";
import myanmarJson from "../lib/myanmar.json";
import laosPorts from "../lib/laos_ports.json";
import myanmarPorts from "../lib/myanmar_ports.json";
import mekongCheckpoints from "../lib/mekong_checkpoints.json";
import chinaMyanmarProjects from "../lib/china_myanmar_projects.json";
import chinaLaosProjects from "../lib/china_laos_projects.json";
import mekongArmedGroups from "../lib/mekong_armed_groups.json";
import mekongArmedGroupsLaos from "../lib/mekong_armed_groups_laos.json";
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
      map: null,
      google: null,
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

      showAIDialog: false,
      currentMapType: 'terrain',
      showTrafficLayer: false,
      trafficLayer: null,
      showTransitLayer: false,
      transitLayer: null,
      // AI悬浮窗拖拽相关
      aiFloatPosition: { x: 30, y: 30 }, // 悬浮窗位置
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      dragStartTime: 0,
      // 国界高亮相关
      countryPolygons: {
        myanmar: null,
        laos: null,
      },
    };
  },
  watch: {
    country(newVal, oldVal) {
      console.log(`国家切换: ${oldVal} -> ${newVal}`);
      
      this.currentCountry = newVal;
      
      // 清理所有覆盖物
      this.clearAllOverlays();
      
      // 重置所有按钮状态
      this.showPorts = false;
      this.showCheckpoints = false;
      this.showChinaProjects = false;
      this.showArmedGroups = false;
      
      // 只有在oldVal存在时才更新高亮（避免初始化时高亮）
      if (oldVal !== undefined) {
        this.updateCountryHighlight(newVal);
      }
    }
  },
  mounted() {
    this.initGoogleMap();
  },
  methods: {
    clearAllOverlays() {
      Object.values(this.overlays).forEach(arr => {
        arr.forEach(item => {
          if (item.marker && item.marker.setMap) {
            item.marker.setMap(null);
          }
          if (item.circle && item.circle.setMap) {
            item.circle.setMap(null);
          }
          if (item.polyline && item.polyline.setMap) {
            item.polyline.setMap(null);
          }
          if (item.infoWindow) {
            item.infoWindow.close();
          }
        });
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
      this.overlays[type].forEach(item => {
        if (item.marker && item.marker.setMap) {
          item.marker.setMap(null);
        }
        if (item.circle && item.circle.setMap) {
          item.circle.setMap(null);
        }
        if (item.infoWindow) {
          item.infoWindow.close();
        }
      });
      this.overlays[type] = [];
    },
    changeMapType(type) {
      if (this.map && this.google) {
        this.currentMapType = type;
        let mapTypeId;
        switch (type) {
          case 'roadmap':
            mapTypeId = this.google.maps.MapTypeId.ROADMAP;
            break;
          case 'satellite':
            mapTypeId = this.google.maps.MapTypeId.SATELLITE;
            break;
          case 'terrain':
            mapTypeId = this.google.maps.MapTypeId.TERRAIN;
            break;
          case 'hybrid':
            mapTypeId = this.google.maps.MapTypeId.HYBRID;
            break;
          default:
            mapTypeId = this.google.maps.MapTypeId.TERRAIN;
        }
        this.map.setMapTypeId(mapTypeId);
      }
    },
    
    toggleTrafficLayer() {
      if (this.map && this.google) {
        this.showTrafficLayer = !this.showTrafficLayer;
        
        if (this.showTrafficLayer) {
          // 创建并显示实时交通图层
          if (!this.trafficLayer) {
            this.trafficLayer = new this.google.maps.TrafficLayer();
          }
          this.trafficLayer.setMap(this.map);
        } else {
          // 隐藏实时交通图层
          if (this.trafficLayer) {
            this.trafficLayer.setMap(null);
          }
        }
      }
    },
    
    toggleTransitLayer() {
      if (this.map && this.google) {
        this.showTransitLayer = !this.showTransitLayer;
        
        if (this.showTransitLayer) {
          // 创建并显示公共交通图层
          if (!this.transitLayer) {
            this.transitLayer = new this.google.maps.TransitLayer();
          }
          this.transitLayer.setMap(this.map);
        } else {
          // 隐藏公共交通图层
          if (this.transitLayer) {
            this.transitLayer.setMap(null);
          }
        }
      }
    },
    
    // AI对话相关方法
    toggleAIDialog() {
      this.showAIDialog = !this.showAIDialog;
    },
    
    // AI悬浮窗拖拽相关方法
    startDrag(e) {
      this.dragStartTime = Date.now();
      this.isDragging = false;
      
      const rect = e.currentTarget.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
      e.preventDefault();
    },
    
    onDrag(e) {
      // 如果移动距离超过5px或时间超过1ms，认为是拖拽
      if (!this.isDragging && (Date.now() - this.dragStartTime > 1)) {
        this.isDragging = true;
      }
      
      if (this.isDragging) {
        const containerRect = this.$el.getBoundingClientRect();
        
        // 计算新位置（相对于容器右边和顶部的距离）
        const newX = containerRect.right - e.clientX - this.dragOffset.x;
        const newY = e.clientY - containerRect.top - this.dragOffset.y;
        
        // 限制在容器范围内
        const buttonSize = 35;
        const maxX = containerRect.width - buttonSize;
        const maxY = containerRect.height - buttonSize;
        
        this.aiFloatPosition = {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        };
      }
    },
    
    stopDrag() {
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
      
      // 延迟重置拖拽状态，避免影响点击事件
      setTimeout(() => {
        this.isDragging = false;
      }, 100);
    },
    
    handleClick(e) {
      // 只有在非拖拽状态下才处理点击
      if (!this.isDragging && Date.now() - this.dragStartTime < 200) {
        this.toggleAIDialog();
      }
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
        // Google Maps 直接使用 WGS84 坐标，无需转换
        const position = { lat: port.lat, lng: port.lng };
        
        // 创建标记
        const marker = new this.google.maps.Marker({
          position: position,
          map: this.map,
          title: port.name
        });

        // 创建信息窗口
        const infoWindow = new this.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: ${this.currentCountry === 'myanmar' ? '#0e47b1' : '#009966'};">
                ${port.name}
              </h4>
              ${port.img ? `<img src="${port.img}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
              <p style="margin: 0; font-size: 14px; line-height: 1.4;">${port.desc || ''}</p>
            </div>
          `
        });

        // 点击标记显示信息窗口
        marker.addListener('click', () => {
          // 关闭其他打开的信息窗口
          arr.forEach(item => {
            if (item.infoWindow) {
              item.infoWindow.close();
            }
          });
          infoWindow.open(this.map, marker);
        });

        arr.push({ marker, infoWindow });
      });

      this.overlays.ports = arr;
    },
    renderCheckpoints() {
      const arr = [];
      
      mekongCheckpoints.forEach(pointData => {
        const position = { lat: pointData.lat, lng: pointData.lng };
        
        // 创建自定义图标标记
        const marker = new this.google.maps.Marker({
          position: position,
          map: this.map,
          title: `${pointData.name}（${pointData.type}）`,
          icon: {
            path: this.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2196f3',
            fillOpacity: 0.9,
            strokeColor: '#1976d2',
            strokeWeight: 2
          }
        });

        // 创建信息窗口
        const infoWindow = new this.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #2196f3;">
                ${pointData.name}
              </h4>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">类型：${pointData.type}</p>
              ${pointData.img ? `<img src="${pointData.img}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
              <p style="margin: 0; font-size: 14px; line-height: 1.4;">${pointData.desc || ''}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          // 关闭其他打开的信息窗口
          arr.forEach(item => {
            if (item.infoWindow) {
              item.infoWindow.close();
            }
          });
          infoWindow.open(this.map, marker);
        });

        arr.push({ marker, infoWindow });
      });

      this.overlays.checkpoints = arr;
    },
    renderChinaProjects() {
      const arr = [];
      
      if (this.currentCountry === 'myanmar') {
        chinaMyanmarProjects.forEach(proj => {
          const position = { lat: proj.lat, lng: proj.lng };
          
          const marker = new this.google.maps.Marker({
            position: position,
            map: this.map,
            title: proj.name,
            icon: {
              path: this.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#ff5722',
              fillOpacity: 0.9,
              strokeColor: '#d84315',
              strokeWeight: 2
            }
          });

          const infoWindow = new this.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; color: #ff5722;">
                  ${proj.name}
                </h4>
                ${proj.img ? `<img src="${proj.img}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">${proj.desc || ''}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            arr.forEach(item => {
              if (item.infoWindow) {
                item.infoWindow.close();
              }
            });
            infoWindow.open(this.map, marker);
          });

          arr.push({ marker, infoWindow });
        });
      } else if (this.currentCountry === 'laos') {
        chinaLaosProjects.forEach(proj => {
          if (proj.lat && proj.lng) {
            const position = { lat: proj.lat, lng: proj.lng };
            
            const marker = new this.google.maps.Marker({
              position: position,
              map: this.map,
              title: proj.name,
              icon: {
                path: this.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#4caf50',
                fillOpacity: 0.9,
                strokeColor: '#388e3c',
                strokeWeight: 2
              }
            });

            const infoWindow = new this.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 250px;">
                  <h4 style="margin: 0 0 8px 0; color: #4caf50;">
                    ${proj.name}
                  </h4>
                  ${proj.img ? `<img src="${proj.img}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
                  <p style="margin: 0; font-size: 14px; line-height: 1.4;">${proj.desc || ''}</p>
                </div>
              `
            });

            marker.addListener('click', () => {
              arr.forEach(item => {
                if (item.infoWindow) {
                  item.infoWindow.close();
                }
              });
              infoWindow.open(this.map, marker);
            });

            arr.push({ marker, infoWindow });
          }
        });
      }

      this.overlays.chinaProjects = arr;
    },
    renderArmedGroups() {
      const arr = [];
      
      if (this.currentCountry === 'myanmar') {
        mekongArmedGroups.forEach(group => {
          const position = { lat: group.lat, lng: group.lng };
          
          // 创建圆形区域
          const circle = new this.google.maps.Circle({
            strokeColor: 'rgba(218,29,139,0.8)',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: 'rgba(218,29,139,0.3)',
            fillOpacity: 0.3,
            map: this.map,
            center: position,
            radius: 20000 // 20公里
          });

          // 创建中心标记
          const marker = new this.google.maps.Marker({
            position: position,
            map: this.map,
            title: group.name,
            icon: {
              path: this.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: 'rgba(218,29,139,0.9)',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2
            }
          });

          const infoWindow = new this.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; color: rgba(218,29,139,0.9);">
                  ${group.name}
                </h4>
                ${group.img ? `<img src="${group.img}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">${group.goal || ''}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            arr.forEach(item => {
              if (item.infoWindow) {
                item.infoWindow.close();
              }
            });
            infoWindow.open(this.map, marker);
          });

          arr.push({ marker, infoWindow, circle });
        });
      } else if (this.currentCountry === 'laos') {
        mekongArmedGroupsLaos.forEach(group => {
          const position = { lat: group.lat, lng: group.lng };
          
          const circle = new this.google.maps.Circle({
            strokeColor: 'rgba(120,29,218,0.8)',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: 'rgba(120,29,218,0.3)',
            fillOpacity: 0.3,
            map: this.map,
            center: position,
            radius: 20000
          });

          const marker = new this.google.maps.Marker({
            position: position,
            map: this.map,
            title: group.name,
            icon: {
              path: this.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: 'rgba(120,29,218,0.9)',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2
            }
          });

          const infoWindow = new this.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; color: rgba(120,29,218,0.9);">
                  ${group.name}
                </h4>
                ${group.img ? `<img src="${group.img}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">${group.goal || ''}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            arr.forEach(item => {
              if (item.infoWindow) {
                item.infoWindow.close();
              }
            });
            infoWindow.open(this.map, marker);
          });

          arr.push({ marker, infoWindow, circle });
        });
      }

      this.overlays.armedGroups = arr;
    },



    async initGoogleMap() {
      const loader = new Loader({
        apiKey: 'AIzaSyCEsS_LOjaVXZwT2GmvJWMBNY1N5kiQPHs',
        version: 'weekly',
        libraries: ['geometry']
      });

      try {
        const google = await loader.load();
        this.google = google;
        
        // 初始化地图
        this.map = new google.maps.Map(document.getElementById('worldMap'), {
          center: { lat: 19.7361, lng: 96.2067 }, // 缅甸中心点
          zoom: 7,
          mapTypeId: google.maps.MapTypeId.TERRAIN, // 使用地形图更好地显示河流
          tilt: 0,
          gestureHandling: 'greedy',
          // 隐藏所有默认控件
          mapTypeControl: false, // 隐藏左上角的地图/卫星切换按钮
          streetViewControl: false, // 隐藏右下角的街景小人
          fullscreenControl: false, // 隐藏右上角的全屏按钮
          zoomControl: false, // 完全隐藏缩放控件
          scaleControl: false, // 隐藏比例尺
          rotateControl: false, // 隐藏旋转控件
          panControl: false, // 隐藏平移控件
          overviewMapControl: false, // 隐藏概览地图控件
          keyboardShortcuts: false, // 禁用键盘快捷键
          disableDoubleClickZoom: false, // 保留双击缩放
          scrollwheel: true, // 保留滚轮缩放
          draggable: true, // 保留拖拽
          // 隐藏右下角的所有控件和信息
          mapTypeControlOptions: {
            mapTypeIds: []
          },
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#193341' }]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#4e6d70' }]
            }
          ]
        });

        // 添加国家边界多边形
        this.addCountryPolygons();
        
        // 初始化时不高亮任何国家
        this.updateCountryHighlight(null);
        
        console.log('Google Maps 初始化成功');
      } catch (error) {
        console.error('Google Maps 加载失败:', error);
      }
    },



    addCountryPolygons() {
      // 1. 缅甸多边形
      const myanmarCoords = myanmarJson.features[0].geometry.coordinates[0];
      const myanmarPath = myanmarCoords.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }));

      const myanmarPolygon = new this.google.maps.Polygon({
        paths: myanmarPath,
        strokeColor: 'transparent',
        strokeOpacity: 0,
        fillColor: 'transparent',
        fillOpacity: 0,
        clickable: true
      });

      myanmarPolygon.setMap(this.map);
      this.countryPolygons.myanmar = myanmarPolygon;
      
      myanmarPolygon.addListener('click', () => {
        this.$emit('country-changed', 'myanmar');
        this.map.setCenter({ lat: 19.7361, lng: 96.2067 });
        this.map.setZoom(7);
        // 立即更新高亮
        this.updateCountryHighlight('myanmar');
      });

      // 2. 老挝多边形
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
        
        // 存储老挝的所有多边形部分
        const laosPolygonParts = [];
        
        polygons.forEach(ringArr => {
          ringArr.forEach(ring => {
            const laosPath = ring.map(coord => ({
              lat: coord[1],
              lng: coord[0]
            }));

            const laosPolygon = new this.google.maps.Polygon({
              paths: laosPath,
              strokeColor: 'transparent',
              strokeOpacity: 0,
              fillColor: 'transparent',
              fillOpacity: 0,
              clickable: true
            });

            laosPolygon.setMap(this.map);
            laosPolygonParts.push(laosPolygon);
            
            laosPolygon.addListener('click', () => {
              this.$emit('country-changed', 'laos');
              this.map.setCenter({ lat: 17.9757, lng: 102.6341 });
              this.map.setZoom(7);
              // 立即更新高亮
              this.updateCountryHighlight('laos');
            });
          });
        });
        
        this.countryPolygons.laos = laosPolygonParts;
      }

      // 初始化完成后会在 initGoogleMap 中设置高亮
    },

    // 更新国家边界高亮
    updateCountryHighlight(selectedCountry) {
      // 重置所有国家边界样式
      if (this.countryPolygons.myanmar) {
        this.countryPolygons.myanmar.setOptions({
          strokeColor: 'transparent',
          strokeOpacity: 0,
          fillColor: 'transparent',
          fillOpacity: 0
        });
      }

      if (this.countryPolygons.laos) {
        if (Array.isArray(this.countryPolygons.laos)) {
          this.countryPolygons.laos.forEach(polygon => {
            polygon.setOptions({
              strokeColor: 'transparent',
              strokeOpacity: 0,
              fillColor: 'transparent',
              fillOpacity: 0
            });
          });
        }
      }

      // 根据选中的国家设置高亮样式
      if (selectedCountry === 'myanmar' && this.countryPolygons.myanmar) {
        this.countryPolygons.myanmar.setOptions({
          strokeColor: '#FF5722',
          strokeOpacity: 1,
          strokeWeight: 10,
          fillColor: 'transparent',
          fillOpacity: 0
        });
      } else if (selectedCountry === 'laos' && this.countryPolygons.laos) {
        if (Array.isArray(this.countryPolygons.laos)) {
          this.countryPolygons.laos.forEach(polygon => {
            polygon.setOptions({
              strokeColor: '#2196F3',
              strokeOpacity: 1,
              strokeWeight: 10,
              fillColor: 'transparent',
              fillOpacity: 0
            });
          });
        }
      }
    },
  },
  beforeDestroy() {
    // 清理拖拽事件监听器
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    
    // 清理所有覆盖物
    this.clearAllOverlays();
  }
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
      
      /* 隐藏Google Maps的默认UI元素 */
      :deep(.gm-style-cc) {
        display: none !important; /* 隐藏版权信息 */
      }
      
      :deep(.gm-bundled-control) {
        display: none !important; /* 隐藏右下角控件组 */
      }
      
      :deep(.gm-style-mtc) {
        display: none !important; /* 隐藏地图类型控件 */
      }
      
      :deep(.gmnoprint) {
        display: none !important; /* 隐藏不可打印元素 */
      }
      
      :deep(.gm-svpc) {
        display: none !important; /* 隐藏街景控件 */
      }
      
      :deep(.gm-fullscreen-control) {
        display: none !important; /* 隐藏全屏控件 */
      }
      
      :deep(.gm-style .gm-style-iw-c) {
        /* 保留信息窗口样式 */
      }
    }
  }
}
/* 功能按钮容器 - 中上部 */
.function-btn-container {
  position: absolute;
  left: 50%;
  top: 30px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 10;
  width: auto;
  max-width: 95%;
  height: auto;
  pointer-events: auto;
  background: rgba(22, 36, 53, 0.5);
  padding: 15px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  
  button {
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px 16px;
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    border-radius: 8px;
    outline: none;
    box-sizing: border-box;
    backdrop-filter: blur(5px);
    white-space: nowrap;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-1px);
    }
  }
  
  .selected-button {
    background: linear-gradient(
      135deg,
      rgba(255, 87, 34, 0.8),
      rgba(255, 152, 0, 0.9)
    );
    color: #fff;
    border: 1px solid rgba(255, 87, 34, 0.8);
    box-shadow: 0 2px 8px rgba(255, 87, 34, 0.3);
    
    &:hover {
      background: linear-gradient(
        135deg,
        rgba(255, 87, 34, 0.9),
        rgba(255, 152, 0, 1)
      );
      transform: translateY(-1px);
    }
  }
}

/* 地图样式切换按钮容器 - 底部 */
.map-style-btn-container {
  position: absolute;
  left: 50%;
  bottom: 15px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 10;
  width: auto;
  max-width: 95%;
  height: auto;
  pointer-events: auto;
  background: rgba(22, 36, 53, 0.5);
  padding: 12px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  
  button {
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 6px 14px;
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    border-radius: 8px;
    outline: none;
    box-sizing: border-box;
    backdrop-filter: blur(5px);
    white-space: nowrap;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-1px);
    }
  }
  
  .selected-button {
    background: linear-gradient(
      135deg,
      rgba(64, 158, 255, 0.8),
      rgba(30, 144, 255, 0.9)
    );
    color: #fff;
    border: 1px solid rgba(64, 158, 255, 0.8);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
    
    &:hover {
      background: linear-gradient(
        135deg,
        rgba(64, 158, 255, 0.9),
        rgba(30, 144, 255, 1)
      );
      transform: translateY(-1px);
    }
  }
}
html, body {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* AI助手悬浮按钮 */
.ai-float-button {
  position: absolute;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  color: white;
  user-select: none;
}

.ai-float-button::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.3;
  animation: pulse 2s infinite;
}

.ai-float-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

.ai-float-button:hover .ai-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.ai-float-button.dragging {
  cursor: grabbing;
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
}

.ai-float-button.dragging::before {
  animation: none;
}

.ai-float-button.dragging .ai-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.ai-float-button.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
}

.ai-float-button.active::before {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.ai-float-button.active:hover {
  box-shadow: 0 6px 25px rgba(255, 107, 107, 0.6);
}

.ai-float-button.active.dragging {
  box-shadow: 0 6px 30px rgba(255, 107, 107, 0.6);
}

.ai-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  position: relative;
  z-index: 1;
}

.ai-icon svg {
  width: 28px;
  height: 28px;
}

.ai-tooltip {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 1001;
}

.ai-tooltip::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid rgba(0, 0, 0, 0.8);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* 全局隐藏Google Maps默认UI元素 */
.gm-style-cc {
  display: none !important; /* 隐藏版权信息 */
}

.gm-bundled-control {
  display: none !important; /* 隐藏右下角控件组 */
}

.gm-style-mtc {
  display: none !important; /* 隐藏地图类型控件 */
}

.gmnoprint {
  display: none !important; /* 隐藏不可打印元素 */
}

.gm-svpc {
  display: none !important; /* 隐藏街景控件 */
}

.gm-fullscreen-control {
  display: none !important; /* 隐藏全屏控件 */
}

.gm-control-active {
  display: none !important; /* 隐藏激活的控件 */
}

/* 隐藏右下角的"报告地图错误"链接 */
.gm-style a[href*="maps.google.com/maps"] {
  display: none !important;
}

/* 隐藏键盘快捷键信息 */
.gm-style .gm-style-iw-d {
  overflow: hidden !important;
}

/* 隐藏Terms of Use等链接 */
.gm-style a[href*="google.com/help/terms_maps"] {
  display: none !important;
}

</style>
