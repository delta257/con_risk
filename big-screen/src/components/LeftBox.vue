<template>
  <div class="left-wrap">
    <dv-border-box-10>
      <div class="title-box">
        <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
        <div>
          <div class="title">东道国风险评估</div>
          <dv-decoration-3 style="width: 150px; height: 30px" />
        </div>
        <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
      </div>
      <div class="button-container">
        <button
          v-for="(button, index) in buttons"
          :key="index"
          :class="{ 'selected-button': index === selectedButton }"
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
    </dv-border-box-10>
    <dv-border-box-7>
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
    <dv-border-box-7>
      <div style="height: 330px">
        <div class="title-box">
          <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
          <div>
            <div class="title">舆情监测</div>
            <dv-decoration-3 style="width: 150px; height: 30px" />
          </div>
          <dv-decoration-4 :reverse="true" style="width: 500px; height: 5px" />
        </div>
        <div class="button-container">
          <button
            v-for="(button, index) in buttons2"
            :key="index"
            :class="{ 'selected-button': index === selectedButton2 }"
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
  </div>
</template>

<script>
import * as echarts from "echarts";
import "echarts-wordcloud";
import TextDialog from "./TextDialog.vue";
import safeEvents from "../json/safeEvents.json";
import focusEvent from "../json/focusEvent.json";

let timer1 = null;
let timer2 = null;
const KEY_WORDS = [
  { name: "输出", value: 34156 },
  { name: "测评", value: 22199 },
  { name: "微控制器", value: 10288 },
  { name: "线网络", value: 1206 },
  { name: "机台", value: 274470 },
  { name: "无线", value: 12311 },
  { name: "输", value: 2062 },
  { name: "开端", value: 4885 },
  { name: "端", value: 32294 },
  { name: "换机器", value: 18574 },
  { name: "测评1", value: 38929 },
  { name: "模块", value: 969 },
  { name: "机", value: 37517 },
  { name: "接", value: 12053 },
  { name: "机器", value: 57299 },
  { name: "牛逼", value: 15418 },
  { name: "你好", value: 22905 },
  { name: "世界", value: 5146 },
  { name: "我", value: 49487 },
  { name: "是", value: 33837 },
  { name: "小世界", value: 4500 },
  { name: "大世界", value: 5744 },
  { name: "前端", value: 4840 },
  { name: "后端", value: 2322 },
];

export default {
  name: "LeftBox",
  components: { TextDialog },
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
      scrollBoardConfig: {
        data: safeEvents.map((item) => [`${item.time},${item.title}`]),
      },
      scrollBoardConfig2: {
        data: focusEvent.map((item) => [`${item.time},${item.title}`]),
      },
      buttons2: [
        { name: "事件追踪", id: 1 },
        { name: "七日热点", id: 2 },
      ],
      selectedButton2: 0,
      rowData: {},
    };
  },
  created() {
    this.initTimer1();
    this.initTimer2();
  },
  mounted() {
    this.initWordCloudChart();
  },
  methods: {
    handleScrollBoardClick(row, type = "1") {
      this.rowData = type == "1" ? safeEvents[row.rowIndex] : focusEvent[row.rowIndex];
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
    initTimer1() {
      timer1 = setInterval(() => {
        this.selectedButton++;
        if (this.selectedButton > this.buttons.length - 1) {
          this.selectedButton = 0;
        }
      }, 3000);
    },
    initTimer2() {
      timer2 = setInterval(() => {
        this.selectedButton2++;
        if (this.selectedButton2 > this.buttons2.length - 1) {
          this.selectedButton2 = 0;
        }
      }, 5 * 1000);
    },
  },
  beforeDestroy() {
    timer1 && clearInterval(timer1);
    timer2 && clearInterval(timer2);
  },
};
</script>

<style lang="less" scoped>
.left-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: rgb(145, 167, 184);
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
    margin: 8px 0;
    padding-left: 10px;
    color: rgb(145, 167, 184);
  }
}
.wordCloudBox {
  height: 300px;
  width: 500px;
  display: flex;
  justify-content: center;
  .wordCloud {
    height: 150px;
    width: 500px;
  }
}

.text-dialog {
  width: 1200px;
  max-height: 500px;
  overflow: hidden;
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
</style>
