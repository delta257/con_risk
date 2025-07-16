<template>
  <div class="left-wrap">
    <dv-border-box-7 class="blue-border">
      <div class="title-box">
        <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
        <div>
          <div class="title">国别风险评估</div>
          <dv-decoration-3 style="width: 150px; height: 30px" />
        </div>
        <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
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
            style="width: 150px; height: 150px"
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
        <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
        <div>
          <div class="title">安全/恐怖袭击事件</div>
          <dv-decoration-3 style="width: 150px; height: 30px" />
        </div>
        <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
      </div>
      <dv-scroll-board
        style="width: 500px; height: 150px; color: rgb(145, 167, 184); cursor: pointer"
        :config="scrollBoardConfig"
        @click="(row) => handleScrollBoardClick(row, '1')"
      />
    </dv-border-box-7>
    <dv-border-box-7 class="blue-border">
      <div style="height: 330px">
        <div class="title-box">
          <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
          <div>
            <div class="title">情报监测</div>
            <dv-decoration-3 style="width: 150px; height: 30px" />
          </div>
          <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
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
            style="
              width: 500px;
              height: 150px;
              color: rgb(145, 167, 184);
              cursor: pointer;
            "
            :config="scrollBoardConfig2"
            @click="(row) => handleScrollBoardClick(row, '2')"
          />
        </div>
      </div>
    </dv-border-box-7>
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
          <!-- <div>
            <span>舆情态度：</span>
            <span>{{ rowData.status }}</span>
          </div> -->
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
    <div class="opinion-btn-group">
      <button
        v-for="(btn, idx) in buttons2"
        :key="btn.id"
        :class="{ selected: selectedButton2 === idx }"
        @click="selectOpinionCategory(idx)"
      >
        {{ btn.name }}
      </button>
    </div>
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

let timer1 = null;
let timer2 = null;
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
      },
      radarOption: {
        radar: {
          axisLabel: {
            style: {
              fill: "rgb(145, 167, 184)",
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
              stroke: "rgba(251, 114, 147, .3)",
            },
          },
          splitLine: {
            style: {
              stroke: "rgba(251, 114, 147, .5)",
              fill: "rgba(251, 114, 147, .2)",
            },
          },
        },
        series: [
          {
            type: "radar",
            data: [85, 80, 60],
            animationCurve: "easeOutBack",
          },
        ],
      },
      barOption1: {
        title: {
          text: "政治风险",
          style: {
            fill: "rgb(145, 167, 184)",
          },
        },
        xAxis: {
          // name: "风险项目",
          nameTextStyle: {
            fill: "rgb(145, 167, 184)",
          },
          nameLocation: "center",
          nameGap: 25,
          axisLabel: {
            style: {
              fill: "rgb(145, 167, 184)",
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
            fill: "rgb(145, 167, 184)",
          },
          axisLabel: {
            style: {
              fill: "rgb(145, 167, 184)",
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
            fill: "rgb(145, 167, 184)",
          },
        },
        xAxis: {
          // name: "风险项目",
          nameTextStyle: {
            fill: "rgb(145, 167, 184)",
          },
          nameLocation: "center",
          nameGap: 25,
          axisLabel: {
            style: {
              fill: "rgb(145, 167, 184)",
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
            fill: "rgb(145, 167, 184)",
          },
          axisLabel: {
            style: {
              fill: "rgb(145, 167, 184)",
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
            fill: "rgb(145, 167, 184)",
          },
        },
        xAxis: {
          // name: "风险项目",
          nameTextStyle: {
            fill: "rgb(145, 167, 184)",
          },
          nameLocation: "center",
          nameGap: 25,
          axisLabel: {
            style: {
              fill: "rgb(145, 167, 184)",
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
            fill: "rgb(145, 167, 184)",
          },
          axisLabel: {
            style: {
              fill: "rgb(145, 167, 184)",
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
  computed: {
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
    // 删除 initTimer1 和 initTimer2
    // initTimer1() {
    //   timer1 = setInterval(() => {
    //     this.selectedButton++;
    //     if (this.selectedButton > this.buttons.length - 1) {
    //       this.selectedButton = 0;
    //     }
    //   }, 3000);
    // },
    // initTimer2() {
    //   timer2 = setInterval(() => {
    //     this.selectedButton2++;
    //     if (this.selectedButton2 > this.buttons2.length - 1) {
    //       this.selectedButton2 = 0;
    //     }
    //   }, 5 * 1000);
    // },
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
  display: flex;
  flex-direction: column;
  gap: 0px;
  color: rgb(145, 167, 184);
  height: 100%; /* 新增，确保填满父容器 */
}
.button-container {
  display: flex;
  button {
    border: 1px solid lightgray; /* 浅灰色外边框 */
    padding: 10px 20px; /* 根据需要调整内边距 */
    margin: 5px; /* 添加一些外边距，使按钮不紧贴在一起 */
    cursor: pointer; /* 鼠标悬停时变为手形 */
    background-color: transparent; /* 初始背景色为透明 */
    transition: background-color 0.3s ease; /* 添加背景色过渡效果 */
    color: rgb(145, 167, 184);
  }

  .selected-button {
    background: linear-gradient(
      to right,
      rgba(173, 216, 230, 0.6),
      rgba(56, 126, 152, 0.8)
    ); /* 渐变的淡蓝色背景 */
  }
}
.country-switch-btn {
  margin-left: 10px;
  padding: 12px 33px;
  border: 1px solid #3fa7ff;
  border-radius: 0px;
  background: rgba(30, 60, 120, 0.7);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
  outline: none;
}
.country-switch-btn:hover,
.country-switch-btn:focus {
  background:rgba(30, 60, 120, 0.7);
  color: #fff;
  border: 1.5px solid #fff;
}
.country-list {
  position: absolute;
  z-index: 100;
  background: #1a233a;
  color: #fff;
  border-radius: 0px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  margin-top: 6px;
  min-width: 90px;
  overflow: hidden;
}
.country-list-item {
  padding: 8px 18px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s, color 0.2s;
}
.country-list-item:hover {
  background: #3fa7ff;
  color: #fff;
}
.country-list-item.selected {
  background: #174a7a;
  color: #fff;
  font-weight: bold;
}
.button-content {
  height: 300px;
  display: flex;
  align-items: center;
  .water-box {
    width: 200px;
    display: flex;
    justify-content: center;
  }
  .bar-content {
    height: 300px;
    display: flex;
    justify-content: center;
    width: 300px;
    & > div {
      height: 300px;
      width: 400px;
    }
    // .b0 {
    //   width: 400px;
    //   height: 300px;
    // }
  }
}
.title-box {
  margin: 10px 0;
  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title {
    margin: 10px 0;
    padding-left: 10px;
    font-size: 16px;
    color: rgb(246, 248, 250);
  }
  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    position: relative;
  }
  .country-btn-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 120px;
  }
  .country-list {
    position: absolute;
    right: 0;
    top: 110%;
    // 保证弹窗紧贴按钮下方并右对齐
    min-width: 100px;
    max-width: 180px;
    width: max-content;
  }
}
.wordCloudBox {
  height: 300px;
  width: 500px;
  display: flex;
  justify-content: center;
  .wordCloud {
    height: 200px;
    width: 500px;
  }
}

.text-dialog {
  width: 1200px;
  max-height: 1000px;
  overflow: auto;
  padding: 10px;
  border: 1px solid;
  border-radius: 20px;
  .title {
    text-align: center;
  }
  .infoBox {
    display: flex;
    justify-content: space-between;
  }
}
.blue-border {
  border: 2px solid #3fa7ff;
  border-radius: 8px;
  box-sizing: border-box;
  margin-bottom: 10px;
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
