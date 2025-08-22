<template>
  <div class="left-wrap">
    <div class="content-wrapper">
      <dv-border-box-7 class="blue-border">
      <div class="title-box">
        <dv-decoration-4 :reverse="true" :style="{ width: 'calc(100% - 20px)', height: '5px' }" />
        <div>
          <div class="title">国别风险评估</div>
          <dv-decoration-3 style="width: 150px; height: 30px" />
        </div>
        <dv-decoration-4 :reverse="true" :style="{ width: 'calc(100% - 20px)', height: '5px' }" />
      </div>
      <div class="button-container">
        <button
          v-for="(button, index) in buttons"
          :key="index"
          :class="{ 'selected-button': index === selectedButton }"
          @click="selectRiskCategory(index)"
        >
          {{ button.name }}
        </button>
      </div>
      <div class="button-content">
        <div class="water-box">
          <dv-water-level-pond
            :config="waterConfig"
            :style="{ width: '150px', height: '150px' }"
          />
        </div>
        <div class="bar-content">
          <div class="b0" v-if="selectedButton == 0">
            <dv-charts :option="radarOption" />
          </div>
          <div class="b1" v-if="selectedButton == 1">
            <dv-charts :option="barOption1" />
          </div>
          <div class="b2" v-if="selectedButton == 2">
            <dv-charts :option="barOption2" />
          </div>
          <div class="b3" v-if="selectedButton == 3">
            <dv-charts :option="barOption3" />
          </div>
        </div>
      </div>
    </dv-border-box-7>
    <dv-border-box-7 class="blue-border">
      <div class="title-box">
        <dv-decoration-4 :reverse="true" :style="{ width: 'calc(100% - 20px)', height: '5px' }" />
        <div>
          <div class="title">安全/恐怖袭击事件</div>
          <dv-decoration-3 style="width: 150px; height: 30px" />
        </div>
        <dv-decoration-4 :reverse="true" :style="{ width: 'calc(100% - 20px)', height: '5px' }" />
      </div>
      <dv-scroll-board
        :style="{ width: '26.01vw', height: '13.89vh', color: '#ffffff', cursor: 'pointer' }"
        :config="scrollBoardConfig"
        @click="(row) => handleScrollBoardClick(row, '1')"
      />
    </dv-border-box-7>
    <dv-border-box-7 class="blue-border">
      <div style="height: 330px">
        <div class="title-box">
          <dv-decoration-4 :reverse="true" :style="{ width: '26.01vw', height: '0.46vh' }" />
          <div>
            <div class="title">情报监测</div>
            <dv-decoration-3 :style="{ width: '7.81vw', height: '2.78vh' }" />
          </div>
          <dv-decoration-4 :reverse="true" :style="{ width: '26.04vw', height: '0.46vh' }" />
        </div>
        <div class="button-container">
          <button
            v-for="(button, index) in buttons2"
            :key="index"
            :class="{ 'selected-button': index === selectedButton2 }"
            @click="selectOpinionCategory(index)"
          >
            {{ button.name }}
          </button>
        </div>
        <div class="wordCloudBox" v-show="selectedButton2 === 1">
          <div class="wordCloud" ref="wordCloudWRef"></div>
        </div>
        <div v-show="selectedButton2 === 0" class="wordCloudBox">
          <dv-scroll-board
            :style="{
              width: '26.04vw',
              height: '18.52vh',
              color: '#ffffff',
              cursor: 'pointer'
            }"
            :config="scrollBoardConfig2"
            @click="(row) => handleScrollBoardClick(row, '2')"
          />
        </div>
      </div>
    </dv-border-box-7>
    </div>
    
    <TextDialog ref="textDialogRef1">
      <div class="text-dialog" @click.stop>
        <div class="title">{{ rowData.title }}</div>
        <div class="infoBox">
          <div>
            <span>安全时间：</span>
            <span>{{ rowData.time }}</span>
          </div>
          <div>
            <span>安全人物：</span>
            <span>{{ rowData.person }}</span>
          </div>
        </div>
        <div class="infoBox">
          <div>
            <span>安全地点：</span>
            <span>{{ rowData.address }}</span>
          </div>

        </div>
        <div v-html="rowData.description"></div>
      </div>
    </TextDialog>
    <TextDialog ref="textDialogRef2">
      <div class="text-dialog" @click.stop>
        <div class="title">{{ rowData.title }}</div>
        <div class="infoBox">
          <div>
            <span>舆情时间：</span>
            <span>{{ rowData.time }}</span>
          </div>
          <div>
            <span>舆情人物：</span>
            <span>{{ rowData.person }}</span>
          </div>
        </div>
        <div class="infoBox">
          <div>
            <span>地址：</span>
            <span>{{ rowData.address }}</span>
          </div>
          <div>
            <span>舆情态度：</span>
            <span>{{ rowData.attitude }}</span>
          </div>
        </div>
        <div v-html="rowData.event"></div>
      </div>
    </TextDialog>

    <TextDialog v-model="showDailyDialog">
      <div class="map-popup">
        <div class="popup-title">每日报告</div>
        <div class="popup-desc" v-html="dailyReport && dailyReport.content"></div>
        <span class="popup-close" @click="showDailyDialog = false">×</span>
      </div>
    </TextDialog>
    <TextDialog v-model="showWeeklyDialog">
      <div class="map-popup">
        <div class="popup-title">每周报告</div>
        <div class="popup-desc" v-html="weeklyReport && weeklyReport.content"></div>
        <span class="popup-close" @click="showWeeklyDialog = false">×</span>
      </div>
    </TextDialog>
  </div>
</template>

<script>
import * as echarts from "echarts";
import "echarts-wordcloud";
import TextDialog from "./TextDialog.vue";
import riskMyanmar from "../json/risk_myanmar.json";
import riskLaos from "../json/risk_laos.json";


const KEY_WORDS = [
  { name: "恐怖袭击", value: 34156 },
  { name: "边境冲突", value: 22199 },
  { name: "通货膨胀", value: 10288 },
  { name: "汇率波动", value: 1206 },
  { name: "武装冲突", value: 274470 },
  { name: "洪水", value: 12311 },
  { name: "水污染", value: 2062 },
  { name: "地质滑坡", value: 4885 },
  { name: "交通中断", value: 32294 },
  { name: "机场停航", value: 18574 },
  { name: "电力停工", value: 38929 },
  { name: "食物中毒", value: 969 },
  { name: "文化冲突", value: 37517 },
  { name: "台风", value: 12053 },
  { name: "森林", value: 57299 },
  { name: "气象", value: 15418 },
  { name: "疫情", value: 22905 },
  { name: "交通", value: 5146 },
  { name: "港口", value: 49487 },
  { name: "人权", value: 33837 },
  { name: "少数民族", value: 4500 },
  { name: "金三角", value: 5744 },
  { name: "枪击", value: 4840 },
  { name: "毒品", value: 2322 },
];

export default {
  name: "LeftBox",
  components: { TextDialog },
  props: {
    country: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      selectedButton: 0, // 初始选中第一个按钮
      buttons: [
        { name: "综合风险", id: 1 },
        { name: "政治风险", id: 2 },
        { name: "经济风险", id: 3 },
        { name: "社会风险", id: 4 },
      ],
      waterConfig: {
        data: [55],
        shape: "round",
        fill: ['#1565C0', '#1976D2', '#42A5F5'], // 深蓝色系波浪
        waveStyle: {
          fill: '#1565C0',
          fillOpacity: 1,
        },
        outlineStyle: {
          border: {
            width: 3,
            color: '#1565C0',
          },
        },
        textStyle: {
          fontSize: 25,
          color: '#ffffff',
          fontWeight: 'bold',
        }
      },
      radarOption: {
        radar: {
          axisLabel: {
            style: {
              fill: "#ffffff",
              fontSize: 13
            },
          },
          polygon: true,
          indicator: [
            { name: "政治风险", max: 100 },
            { name: "经济风险", max: 100 },
            { name: "社会风险", max: 100 },
          ],
          axisLine: {
            style: {
              stroke: "rgba(200, 80, 120, .6)",
            },
          },
          splitLine: {
            style: {
              stroke: "rgba(200, 80, 120, .8)",
              fill: "rgba(200, 80, 120, .4)",
            },
          },
        },
        series: [
          {
            type: "radar",
            data: [85, 80, 60],
            animationCurve: "easeOutBack",
            itemStyle: {
              color: '#C8506E', // 深粉红色数据点
              borderColor: '#fff',
              borderWidth: 2,
            },
            lineStyle: {
              color: '#C8506E', // 深粉红色连线
              width: 2,
            },
            areaStyle: {
              color: 'rgba(200, 80, 110, 0.5)', // 深粉红色填充区域
            }
          },
        ],
      },
      barOption1: {
        title: {
          text: "政治风险",
          style: {
            fill: "#ffffff",
          },
        },
        xAxis: {
          // name: "风险项目",
          nameTextStyle: {
            fill: "#ffffff",
          },
          nameLocation: "center",
          nameGap: 25,
          axisLabel: {
            style: {
              fill: "#ffffff",
              fontSize: 8,
              fontWeight: "300",
              rotate: -20,
            },
          },
          data: [
            "政府稳定",
            "贪污",
            "军事介入政治",
            "官僚作风素质",
            "政府凝聚力",
            "战争",
          ],
        },
        yAxis: {
          name: "风险值",
          nameTextStyle: {
            fill: "#ffffff",
          },
          axisLabel: {
            style: {
              fill: "#ffffff",
            },
          },
          data: "value",
        },
        series: [
          {
            data: [30, 50, 30, 50, 60, 80],
            type: "bar",
            backgroundBar: {
              show: true,
            },
          },
        ],
      },
      barOption2: {
        title: {
          text: "经济风险",
          style: {
            fill: "#ffffff",
          },
        },
        xAxis: {
          // name: "风险项目",
          nameTextStyle: {
            fill: "#ffffff",
          },
          nameLocation: "center",
          nameGap: 25,
          axisLabel: {
            style: {
              fill: "#ffffff",
              fontSize: 8,
              fontWeight: "300",
              rotate: -20,
            },
          },
          data: [
            "投资概况",
            "失业",
            "消费者信心",
            "汇率稳定风险",
            "GDP增长风险",
            "通胀风险",
          ],
        },
        yAxis: {
          name: "风险值",
          nameTextStyle: {
            fill: "#ffffff",
          },
          axisLabel: {
            style: {
              fill: "#ffffff",
            },
          },
          data: "value",
        },
        series: [
          {
            data: [20, 30, 10, 50, 30, 90],
            type: "bar",
            backgroundBar: {
              show: true,
            },
          },
        ],
      },
      barOption3: {
        title: {
          text: "社会风险",
          style: {
            fill: "#ffffff",
          },
        },
        xAxis: {
          // name: "风险项目",
          nameTextStyle: {
            fill: "#ffffff",
          },
          nameLocation: "center",
          nameGap: 25,
          axisLabel: {
            style: {
              fill: "#ffffff",
              fontSize: 8,
              fontWeight: "300",
              rotate: -20,
            },
          },
          data: [
            "内部冲突",
            "宗教紧张",
            "法律与秩序",
            "种族关系紧张",
            "贫穷",
            "恐怖主义",
          ],
        },
        yAxis: {
          name: "风险值",
          data: "value",
          nameTextStyle: {
            fill: "#ffffff",
          },
          axisLabel: {
            style: {
              fill: "#ffffff",
            },
          },
        },
        series: [
          {
            data: [20, 30, 50, 60, 70, 80],
            type: "bar",
            backgroundBar: {
              show: true,
            },
          },
        ],
      },
      safeEvents: [],
      focusEvent: [],
      scrollBoardConfig: { data: [] },
      scrollBoardConfig2: { data: [] },
      buttons2: [
        { name: "事件追踪", id: 1 },
        { name: "七日热点", id: 2 },
        { name: "每日报告", id: 3 },
        { name: "每周报告", id: 4 },
      ],
      selectedButton2: 0,
      dailyReport: null,
      weeklyReport: null,
      showDailyDialog: false,
      showWeeklyDialog: false,
      rowData: {},
      riskData: {},
    };
  },

  watch: {
    country: {
      immediate: true,
      handler(newVal) {
        this.loadCountryData(newVal);
        // 风险评估数据
        if (newVal === "myanmar") {
          this.riskData = riskMyanmar;
          import("../json/safeEvents.json").then(m => {
            this.safeEvents = m.default;
            this.scrollBoardConfig.data = this.safeEvents.map(item => [`${item.time},${item.title}`]);
          });
          import("../json/focusEvent.json").then(m => {
            this.focusEvent = m.default;
            this.scrollBoardConfig2.data = this.focusEvent.map(item => [`${item.time},${item.title}`]);
          });
        } else if (newVal === "laos") {
          this.riskData = riskLaos;
          import("../json/safeEvents_laos.json").then(m => {
            this.safeEvents = m.default;
            this.scrollBoardConfig.data = this.safeEvents.map(item => [`${item.time},${item.title}`]);
          });
          import("../json/focusEvent_laos.json").then(m => {
            this.focusEvent = m.default;
            this.scrollBoardConfig2.data = this.focusEvent.map(item => [`${item.time},${item.title}`]);
          });
        }
        // 这里可以根据 riskData 更新 radarOption、barOption1/2/3、waterConfig 等
        if (this.riskData.radar) this.radarOption.series[0].data = this.riskData.radar;
        if (this.riskData.bar1) this.barOption1.series[0].data = this.riskData.bar1;
        if (this.riskData.bar2) this.barOption2.series[0].data = this.riskData.bar2;
        if (this.riskData.bar3) this.barOption3.series[0].data = this.riskData.bar3;
        if (this.riskData.water) this.waterConfig.data = this.riskData.water;
      },
    },
  },
  created() {
    this.loadCountryData(this.country);
  },
  mounted() {
    this.initWordCloudChart();
  },
  methods: {
    loadCountryData(country) {
      if (country === "myanmar") {
        this.riskData = riskMyanmar;
        import("../json/safeEvents.json").then(m => {
          this.safeEvents = m.default;
          this.scrollBoardConfig = { data: this.safeEvents.map(item => [`${item.time},${item.title}`]) };
        });
        import("../json/focusEvent.json").then(m => {
          this.focusEvent = m.default;
          this.scrollBoardConfig2 = { data: this.focusEvent.map(item => [`${item.time},${item.title}`]) };
        });
        import("../json/daily_report_myanmar.json").then(m => {
          this.dailyReport = m.default;
        });
        import("../json/weekly_report_myanmar.json").then(m => {
          this.weeklyReport = m.default;
        });
      } else if (country === "laos") {
        this.riskData = riskLaos;
        import("../json/safeEvents_laos.json").then(m => {
          this.safeEvents = m.default;
          this.scrollBoardConfig = { data: this.safeEvents.map(item => [`${item.time},${item.title}`]) };
        });
        import("../json/focusEvent_laos.json").then(m => {
          this.focusEvent = m.default;
          this.scrollBoardConfig2 = { data: this.focusEvent.map(item => [`${item.time},${item.title}`]) };
        });
        import("../json/daily_report_laos.json").then(m => {
          this.dailyReport = m.default;
        });
        import("../json/weekly_report_laos.json").then(m => {
          this.weeklyReport = m.default;
        });
      }
      // 这里可以根据 riskData 更新 radarOption、barOption1/2/3、waterConfig 等
      if (this.riskData.radar) this.radarOption.series[0].data = this.riskData.radar;
      if (this.riskData.bar1) this.barOption1.series[0].data = this.riskData.bar1;
      if (this.riskData.bar2) this.barOption2.series[0].data = this.riskData.bar2;
      if (this.riskData.bar3) this.barOption3.series[0].data = this.riskData.bar3;
      if (this.riskData.water) this.waterConfig.data = this.riskData.water;
    },
    handleScrollBoardClick(row, type = "1") {
      this.rowData = type == "1" ? this.safeEvents[row.rowIndex] : this.focusEvent[row.rowIndex];
      if (type == "1") {
        this.$refs.textDialogRef1.showDialog();
      } else {
        this.$refs.textDialogRef2.showDialog();
      }
    },
    initWordCloudChart() {
      const myChart = echarts.init(this.$refs.wordCloudWRef);
      myChart.setOption({
        series: [
          {
            type: "wordCloud",
            gridSize: 20,
            shape: "pentagon", // 词云形状，默认circle(圆形)，cardioid（心形）、diamond（菱形 正方形）、triangle-forward、triangle（三角形）、star（星形）、pentagon （五边形）；
            sizeRange: [10, 50], // 字体大小范围
            rotationRange: [0, 0], // 设置文字倾斜角度
            drawOutOfBound: false,
            textStyle: {
              fontFamily: "Arial",
              color: function () {
                return (
                  "rgb(" +
                  [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                  ].join(",") +
                  ")"
                );
              },
            },
            data: KEY_WORDS,
          },
        ],
      });
    },

    // 新增：按钮点击切换风险类别
    selectRiskCategory(idx) {
      this.selectedButton = idx;
    },
    // 新增：按钮点击切换舆情类别
    selectOpinionCategory(idx) {
      this.selectedButton2 = idx;
      if (idx === 2) {
        this.showDailyDialog = true;
      } else if (idx === 3) {
        this.showWeeklyDialog = true;
      }
    },
  },
  beforeDestroy() {
    // 删除定时器清理
    // timer1 && clearInterval(timer1);
    // timer2 && clearInterval(timer2);
  },
};
</script>

<style lang="less" scoped>
.left-wrap {
  color: rgba(145, 167, 184, 0.8);
  height: 100%; /* 新增，确保填满父容器 */
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0px;
  backdrop-filter: blur(10px);
  background: rgba(22, 36, 53, 0.65); /* 半透明背景 */
  height: 100%;
}
.button-container {
  display: flex;
  button {
    border: 1px solid lightgray;
    padding: 0.52vw 1.04vw; // 10px 20px -> vw
    margin: 0.26vw; // 5px -> vw
    cursor: pointer;
    background-color: transparent;
    transition: background-color 0.3s ease;
    color: #ffffff;
    font-size: 0.83vw; // 16px/1920*100
  }

  .selected-button {
    background: linear-gradient(
      to right,
      rgba(173, 216, 230, 0.8),
      rgba(56, 126, 152, 0.8)
    );
  }
}

.button-content {
  height: 27.78vh; // 300px/1080*100
  display: flex;
  align-items: center;
  .water-box {
    width: 10.42vw; // 200px/1920*100
    height: 18.52vh; // 200px/1080*100 - 与水位图使用相同的vh基准
    display: flex;
    justify-content: center;
    align-items: center; // 垂直居中对齐
  }
  .bar-content {
    height: 27.78vh; // 300px/1080*100
    display: flex;
    justify-content: center;
    width: 17.63vw; // 300px/1920*100
    & > div {
      height: 27.78vh; // 300px/1080*100
      width: 20.83vw; // 400px/1920*100
    }
  }
}
.title-box {
  margin: 0.93vh 0; // 10px/1080*100
  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title {
    margin: 0.93vh 0; // 10px/1080*100
    padding-left: 0.52vw; // 10px/1920*100
    font-size: 0.83vw; // 16px/1920*100
    color: rgb(246, 248, 250);
  }
}
.wordCloudBox {
  height: 27.78vh; // 300px/1080*100
  width: 26.04vw; // 500px/1920*100
  display: flex;
  justify-content: center;
  .wordCloud {
    height: 18.52vh; // 200px/1080*100
    width: 26.04vw; // 500px/1920*100
  }
}

.text-dialog {
  width: 62.5vw; // 1200px/1920*100
  max-width: 90vw; // 防止在小屏幕上过宽
  max-height: 80vh; // 防止超出屏幕高度
  overflow: auto;
  padding: 0.52vw; // 10px/1920*100
  border: 1px solid;
  border-radius: 1.04vw; // 20px/1920*100
  .title {
    text-align: center;
  }
  .infoBox {
    display: flex;
    justify-content: space-between;
  }
}
.blue-border {
  border: 0.1vw solid #3fa7ff; // 2px/1920*100
  border-radius: 0.42vw; // 8px/1920*100
  box-sizing: border-box;
  margin-bottom: 0.93vh; // 10px/1080*100
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
