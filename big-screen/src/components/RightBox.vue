<template>
  <div class="rightBox">
    <div class="timeBox">
      <dv-border-box-9>
        <div class="timeline">
          <dv-decoration-1 style="width: 200px; height: 50px" />
          <div class="time">
            <div class="timeText">{{ currentTime }}</div>
            <div class="dateBox">
              <div>{{ currentDate }}</div>
              <div>{{ currentWeek }}</div>
            </div>
          </div>
        </div>
      </dv-border-box-9>
    </div>
    <div class="hostCountryBox">
      <dv-border-box-12>
        <div class="profitInnerBox">
          <div class="titleBox">
            <dv-decoration-7 style="width: 150px; height: 30px">
              <div class="text">国家概况</div>
            </dv-decoration-7>
            <div class="line"></div>
          </div>
          <div class="contentBox">
            <div v-for="item in hostInfoList" :key="item.id" class="item" @click="showHostInfoDialog(item)">
              <img :src="item.src" alt="" />
              <div>{{ item.name }}</div>
            </div>
          </div>
        </div>
      </dv-border-box-12>
    </div>
    <div class="profitBox">
      <dv-border-box-12>
        <div class="profitInnerBox">
          <div class="titleBox">
            <dv-decoration-7 style="width: 150px; height: 30px">
              <div class="text">主要地区</div>
            </dv-decoration-7>
            <div class="line"></div>
          </div>
          <div class="contentBox">
            <div class="industryLits" style="grid-template-columns: repeat(3, 1fr); grid-template-rows: auto; width: 100%;">
              <div
                v-for="(item, index) in projects"
                :key="item.id"
                class="item"
                :class="[3, 2].includes(index) ? 'active2' : 'active1'"
                @click="showDialog(item.id, $event)"
                style="display: flex; align-items: center; justify-content: center; text-align: center;"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
      </dv-border-box-12>
    </div>
    <div class="ngoBox">
      <dv-border-box-12>
        <div class="titleBox">
          <dv-decoration-7 style="width: 150px; height: 30px">
            <div class="text">主要组织</div>
          </dv-decoration-7>
          <div class="line"></div>
        </div>
        <!-- <div class="ngoList">
          <div v-for="item in ngoImgs" :key="item.id" class="ngoItem">
            <img :src="item.src" alt="" />
            <div class="ngoName">{{ item.name }}</div>
          </div>
        </div> -->
        <div class="blockList">
          <div
            v-for="item in blocks"
            :key="item.id"
            class="blockItem"
            @click="showOrgTable(item)"
          >
            <div>{{ item.name }}</div>
          </div>
        </div>
      </dv-border-box-12>
    </div>


    <TextDialog ref="textDialogRef">
      <div class="region-popup" @click.stop>
        <div class="popup-title">{{ rowData.name }}</div>
        <img v-if="rowData.img" :src="require(`@/${rowData.img}`)" class="popup-img" alt="项目图片" />
        <div class="popup-desc" v-html="rowData.detail"></div>
        <span class="popup-close" @click="$refs.textDialogRef.closeDialog()">×</span>
      </div>
    </TextDialog>
    <TextDialog ref="textDialogRef2">
      <div class="region-popup" @click.stop>
        <div class="popup-title">{{ currentOrgTitle }}</div>
        <div class="popup-desc" v-html="currentOrgContent"></div>
        <span class="popup-close" @click="$refs.textDialogRef2.closeDialog()">×</span>
      </div>
    </TextDialog>
    <TextDialog ref="hostInfoDialogRef">
      <div class="region-popup" @click.stop>
        <div class="popup-title">{{ hostInfoRowData.name }}</div>
        <img v-if="hostInfoRowData.img" :src="require(`@/${hostInfoRowData.img}`)" class="popup-img" alt="图片" />
        <div class="popup-desc" v-html="hostInfoRowData.detail"></div>
        <span class="popup-close" @click="$refs.hostInfoDialogRef.closeDialog()">×</span>
      </div>
    </TextDialog>
    <TextDialog ref="partyTableDialogRef">
      <div class="orgTableBox popup-table-box" @click.stop>
        <div class="popup-title popup-table-title">{{ partyTableTitle }}</div>
        <table class="popup-table" border="1" cellspacing="0" cellpadding="4">
          <thead>
            <tr>
              <th class="col-name">政党名称</th>
              <th>英文名</th>
              <th class="col-leader">领导人</th>
              <th class="col-founded">成立时间</th>
              <th>目标宗旨</th>
              <th>当前状态</th>
              <th>支持基础</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="party in partyList" :key="party.id">
              <td class="col-name" @click="showPartyDetail(party)">{{ party.name }}</td>
              <td>{{ party.name_en }}</td>
              <td class="col-leader">{{ party.leader }}</td>
              <td class="col-founded">{{ party.founded }}</td>
              <td>{{ party.main_goals }}</td>
              <td>{{ party.current_status }}</td>
              <td>{{ party.support_base }}</td>
            </tr>
          </tbody>
        </table>
        <span class="popup-close" @click="$refs.partyTableDialogRef.closeDialog()">×</span>
      </div>
    </TextDialog>
    <TextDialog ref="partyDetailDialogRef">
      <div class="region-popup" @click.stop>
        <div class="popup-title">{{ partyDetailTitle }}</div>
        <div class="popup-desc" v-html="partyDetailContent"></div>
        <span class="popup-close" @click="$refs.partyDetailDialogRef.closeDialog()">×</span>
      </div>
    </TextDialog>
    <TextDialog ref="armedTableDialogRef">
      <div class="orgTableBox popup-table-box" @click.stop>
        <div class="popup-title popup-table-title">{{ armedTableTitle }}</div>
        <table class="popup-table" border="1" cellspacing="0" cellpadding="4">
          <thead>
            <tr>
              <th class="col-name">组织名称</th>
              <th>英文名</th>
              <th class="col-leader">领导人</th>
              <th class="col-founded">成立时间</th>
              <th>主要活动区域</th>
              <th>宗旨</th>
              <th>当前状态</th>
              <th>支持基础</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="armed in armedList" :key="armed.id">
              <td class="col-name" @click="showArmedDetail(armed)">{{ armed.name }}</td>
              <td>{{ armed.name_en }}</td>
              <td class="col-leader">{{ armed.leader }}</td>
              <td class="col-founded">{{ armed.founded }}</td>
              <td>{{ armed.region }}</td>
              <td>{{ armed.purpose }}</td>
              <td>{{ armed.current_status }}</td>
              <td>{{ armed.support_base }}</td>
            </tr>
          </tbody>
        </table>
        <span class="popup-close" @click="$refs.armedTableDialogRef.closeDialog()">×</span>
      </div>
    </TextDialog>
    <TextDialog ref="armedDetailDialogRef">
      <div class="region-popup" @click.stop>
        <div class="popup-title">{{ armedDetailTitle }}</div>
        <div class="popup-desc" v-html="armedDetailContent"></div>
        <span class="popup-close" @click="$refs.armedDetailDialogRef.closeDialog()">×</span>
      </div>
    </TextDialog>
  </div>
</template>

<script>
import dayjs from "dayjs";
import ngo1 from "../assets/right/ngo1.png";
import ngo2 from "../assets/right/ngo2.png";
import ngo3 from "../assets/right/ngo3.png";
import ngo4 from "../assets/right/ngo4.png";
import ngo5 from "../assets/right/ngo5.png";
import ngo6 from "../assets/right/ngo6.png";

import iconSvg1 from "../assets/svg/icon1.svg";
import iconSvg2 from "../assets/svg/icon2.svg";
import iconSvg3 from "../assets/svg/icon3.svg";
import iconSvg4 from "../assets/svg/icon4.svg";
import iconSvg5 from "../assets/svg/icon5.svg";
import iconSvg6 from "../assets/svg/icon6.svg";

import TextDialog from "./TextDialog.vue";
import riskMyanmar from "../json/risk_myanmar.json";
import riskLaos from "../json/risk_laos.json";
import myanmarProvinces from "../json/myanmar_provinces.json";
import laosProvinces from "../json/laos_provinces.json";

let timer = null;
let timer2 = null;
export default {
  name: "RightBox",
  props: {
    country: {
      type: String,
      required: true,
    },
  },
  components: { TextDialog },
  data() {
    return {
      currentTime: "",
      currentDate: "",
      currentWeek: "",
      ngoImgs: [
        { id: 1, name: "Foreign Correspondents' Club of Myanmar", src: ngo1 },
        { id: 2, name: "Myanmar Veterans' Organisation", src: ngo2 },
        {
          id: 3,
          name: "Myanmar Maternal and Child Welfare Association",
          src: ngo3,
        },
        {
          id: 4,
          name: "Union of Myanmar Federation of Chambers of Commerce and Industry",
          src: ngo4,
        },
        { id: 5, name: "Myanmar Dental Association", src: ngo5 },
        { id: 6, name: "Myanmar Medical Association", src: ngo6 },
      ],
      blocks: [
        { id: 3, name: "政党", ngoInfo: [] },
        { id: 4, name: "武装", ngoInfo: [] },
        { id: 5, name: "劳工", ngoInfo: [] },
        { id: 6, name: "宗教", ngoInfo: [] },
        { id: 7, name: "环境", ngoInfo: [] },
      ],
      projects: [],
      currentIndustryIndex: 0,
      hostInfoList: [
        { id: 1, name: "地理概览", src: iconSvg1, detail: "<p>这里是国家地理的详细介绍。</p>" },
        { id: 5, name: "经济概览", src: iconSvg5, detail: "<p>这里是经济环境的详细介绍。</p>" },
        { id: 2, name: "政治概览", src: iconSvg2, detail: "<p>这里是国家政治的详细介绍。</p>" },
      ],
      localEvents: [
        { id: 1, name: "电诈" },
        { id: 2, name: "缅北冲突" },
        { id: 3, name: "华人区" },
        { id: 4, name: "缅甸旅行" },
      ],
      rowData: {},
      riskData: {},
      hostInfoRowData: {}, // 新增
      currentOrgTitle: '主要组织',
      currentOrgContent: '', // 新增，存储文章内容
      partyList: [],
      partyTableTitle: '',
      partyDetailTitle: '',
      partyDetailContent: '',
      armedList: [],
      armedTableTitle: '',
      armedDetailTitle: '',
      armedDetailContent: '',
    };
  },
  watch: {
    country: {
      immediate: true,
      handler(newVal) {
        if (newVal === "myanmar") {
          this.riskData = riskMyanmar;
          this.projects = myanmarProvinces.map((item, idx) => ({ ...item, id: idx + 1, name: item.name_zh }));
        } else if (newVal === "laos") {
          this.riskData = riskLaos;
          this.projects = laosProvinces.map((item, idx) => ({ ...item, id: idx + 1, name: item.name_zh }));
        }
      },
    },
  },
  created() {
    this.initTime();
  },
  computed: {},
  methods: {
    initTime() {
      this.currentTime = dayjs().format("HH:mm:ss");
      this.currentDate = dayjs().format("YYYY-MM-DD");
      this.currentWeek = dayjs().format("dddd");
      timer = setInterval(() => {
        this.currentTime = dayjs().format("HH:mm:ss");
      }, 1000);
    },
    showDialog(id, e) {
      const row = this.projects.find((i) => i.id == id);
      // 组装省/邦详细信息内容
      this.rowData = {
        name: row.name_zh + (row.name_en ? ` (${row.name_en})` : ""),
        img: row.img, // 修正：确保图片字段传递
        detail: `
          <div><b>地理位置：</b>${row.location}</div>
          <div><b>主要民族：</b>${row.ethnic_groups}</div>
          <div><b>主要政治势力：</b>${row.political_forces}</div>
          <div><b>主要武装组织：</b>${row.armed_groups}</div>
          <div><b>主要产业：</b>${row.industries}</div>
        `
      };
      this.$refs.textDialogRef && this.$refs.textDialogRef.showDialog();
    },
    showOrgTable(row) {
      if (row.name === '政党') {
        // 加载政党列表
        let file = `party_list_${this.country}.json`;
        import(`../json/${file}`).then(m => {
          this.partyList = m.default.parties;
          this.partyTableTitle = m.default.title;
          this.$refs.partyTableDialogRef && this.$refs.partyTableDialogRef.showDialog();
        }).catch(() => {
          // 降级为缅甸
          import(`../json/party_list_myanmar.json`).then(m => {
            this.partyList = m.default.parties;
            this.partyTableTitle = m.default.title;
            this.$refs.partyTableDialogRef && this.$refs.partyTableDialogRef.showDialog();
          });
        });
        return;
      }
      if (row.name === '武装') {
        // 加载武装组织列表
        let file = `armed_list_${this.country}.json`;
        import(`../json/${file}`).then(m => {
          this.armedList = m.default.armeds;
          this.armedTableTitle = m.default.title;
          this.$refs.armedTableDialogRef && this.$refs.armedTableDialogRef.showDialog();
        }).catch(() => {
          import(`../json/armed_list_myanmar.json`).then(m => {
            this.armedList = m.default.armeds;
            this.armedTableTitle = m.default.title;
            this.$refs.armedTableDialogRef && this.$refs.armedTableDialogRef.showDialog();
          });
        });
        return;
      }
      this.currentOrgTitle = row.name;
      let fileMap = {
        '政党': 'party_intro',
        '武装': 'armed_intro',
        '劳工': 'labor_intro',
        '宗教': 'religion_intro',
        '环境': 'env_intro',
      };
      let file = fileMap[row.name] + '_' + this.country + '.json';
      import(`../json/${file}`).then(m => {
        this.currentOrgContent = m.default.content;
        this.$refs.textDialogRef2 && this.$refs.textDialogRef2.showDialog();
      }).catch(() => {
        import(`../json/${fileMap[row.name]}_myanmar.json`).then(m => {
          this.currentOrgContent = m.default.content;
          this.$refs.textDialogRef2 && this.$refs.textDialogRef2.showDialog();
        });
      });
    },
    showPartyDetail(party) {
      // 加载政党详细介绍
      let file = party.detail_file;
      // 判断国家
      if (!file.endsWith(`_${this.country}.json`)) {
        // 兼容老文件名
        let base = file.replace(/_myanmar|_laos/, '');
        file = `${base}_${this.country}.json`;
      }
      import(`../json/${file}`).then(m => {
        this.partyDetailTitle = party.name + (party.name_en ? ` (${party.name_en})` : '');
        this.partyDetailContent = m.default.content || m.default.detail || '';
        this.$refs.partyDetailDialogRef && this.$refs.partyDetailDialogRef.showDialog();
      }).catch(() => {
        this.partyDetailTitle = party.name;
        this.partyDetailContent = '暂无详细介绍';
        this.$refs.partyDetailDialogRef && this.$refs.partyDetailDialogRef.showDialog();
      });
    },
    showHostInfoDialog(item) {
      // 动态加载地理/经济/政治概览json
      let fileMap = {
        '地理概览': 'geo_intro',
        '经济概览': 'economy_intro',
        '政治概览': 'polit_intro',
      };
      let file = fileMap[item.name] + '_' + this.country + '.json';
      import(`../json/${file}`).then(m => {
        this.hostInfoRowData = {
          name: m.default.title,
          detail: m.default.content
        };
        this.$refs.hostInfoDialogRef && this.$refs.hostInfoDialogRef.showDialog();
      }).catch(() => {
        // 降级为缅甸默认
        import(`../json/${fileMap[item.name]}_myanmar.json`).then(m => {
          this.hostInfoRowData = {
            name: m.default.title,
            detail: m.default.content
          };
          this.$refs.hostInfoDialogRef && this.$refs.hostInfoDialogRef.showDialog();
        });
      });
    },
    showArmedDetail(armed) {
      // 加载武装组织详细介绍
      let file = armed.detail_file;
      if (!file.endsWith(`_${this.country}.json`)) {
        let base = file.replace(/_myanmar|_laos/, '');
        file = `${base}_${this.country}.json`;
      }
      import(`../json/${file}`).then(m => {
        this.armedDetailTitle = armed.name + (armed.name_en ? ` (${armed.name_en})` : '');
        this.armedDetailContent = m.default.content || m.default.detail || '';
        this.$refs.armedDetailDialogRef && this.$refs.armedDetailDialogRef.showDialog();
      }).catch(() => {
        this.armedDetailTitle = armed.name;
        this.armedDetailContent = '暂无详细介绍';
        this.$refs.armedDetailDialogRef && this.$refs.armedDetailDialogRef.showDialog();
      });
    },
  },
  beforeDestroy() {
    timer && clearInterval(timer);
    timer2 && clearInterval(timer2);
  },
};
</script>

<style lang="less" scoped>
.rightBox {
  color: rgb(145, 167, 184);
  & > div {
    margin-bottom: 0px;
  }
  & > div:last-child {
    margin-bottom: 0;
  }
  .timeBox {
    display: flex;
    .timeline {
      display: flex;
      .time {
        display: flex;
        align-items: center;
        height: 50px;
        width: 200px;
        & > div {
          flex: 1;
        }
        .timeText {
          font-size: 20px;
          font-weight: 600;
          border-right: 1px solid #fff;
        }
        .dateBox {
          font-size: 13px;
          text-align: right;
        }
      }
    }
  }
  .titleBox {
    height: 50px;
    padding: 10px;
    box-sizing: border-box;
    .text {
      padding: 0 10px;
      font-size: 18px;
      color: rgb(255, 255, 255);
    }
    .line {
      height: 1px;
      background-color: rgb(145, 167, 184);
    }
  }
  .ngoBox {
    .ngoList {
      // display: flex;
      // flex-wrap: wrap;
      // gap: 10px;
      // justify-content: center;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-column-gap: 10px;
      grid-row-gap: 10px;
      padding: 15px;
      .ngoItem {
        @ngoWidth: 80px;
        width: @ngoWidth;
        img {
          width: @ngoWidth;
          height: 80px;
          object-fit: cover;
        }
        .ngoName {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 400;
        }
      }
    }
    .blockList {
      display: flex;
      box-sizing: border-box;
      padding: 0 10px 15px 10px;
      .blockItem {
        flex: 1;
        height: 215px;
        display: flex;
        justify-content: center;
        align-items: center;
        writing-mode: vertical-lr;
        transition: all 0.3s ease;
        cursor: pointer;
        font-size: 24px;
        letter-spacing: 24px;
        &:nth-child(odd) {
          background-color: rgba(0, 0, 0, 0.5);
        }
        &:hover {
          flex: 2;
          font-size: 32px;
        }
      }
    }
  }
  .profitBox {
    width: 100%;
    height: 415px;
    margin-top: 0px;
    .profitInnerBox {
      height: 100%;
      padding: 0px 8px;
      box-sizing: border-box;
    }
    .titleBox{
      margin-top: 0px;
    }
    .innerBox {
      height: 280px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
    }
    .contentBox {
      display: flex;
      // & > div {
      //   flex: 1;
      // }
      .left {
        flex: 2;
      }
      .industryName {
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
      }
      .industryLits {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(3, 1fr);
        grid-column-gap: 5px;
        grid-row-gap: 20px;
        box-sizing: border-box;
        padding-left: 12px;

        .item {
          cursor: pointer;
          width: 140px;
          height: 30px;
          line-height: 30px;
          padding-left: 10px;
          box-sizing: border-box;
          border-left: 2px solid;
          background-color: rgba(22, 36, 53, 0.5);
          position: relative;
          font-size: 14px;
          &::before {
            content: "";
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(10px);
            z-index: -1;
          }
        }
        .active {
          border-left-color: aqua;
          border-left-width: 2px;
        }
        .active1 {
          border-left-color: aqua;
          border-left-width: 2px;
        }
        .active2 {
          border-left-color: rgb(133, 113, 97);
          border-left-width: 2px;
        }
      }
      .right {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 20px;
        & > div {
          display: flex;
          align-items: center;
          gap: 10px;
          .icon1 {
            width: 50px;
            height: 50px;
          }
          .icon2 {
            width: 50px;
            height: 50px;
          }
          .itemName {
            width: 150px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-size: 12px;
            font-weight: 400;
          }
        }
      }
      .right2 {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 10px;
        text-align: center;
        .eventBox {
          .title {
            color: rgb(35, 113, 176);
            margin-bottom: 10px;
            font-size: 20px;
          }
          .itemName {
            margin-bottom: 5px;
            position: relative;
            color: rgb(145, 167, 184);
            font-size: 14px;
            // background-image: linear-gradient(
            //   180deg,
            //   rgba(47, 61, 82, 0.1) 40%,
            //   rgb(132, 132, 132, 0.6) 100%
            // );
          }
        }
      }
    }
  }
  .hostCountryBox {
    .contentBox {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr;
      grid-column-gap: 30px;
      grid-row-gap: 0px;
      padding: 30px 15px 30px 15px;
      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        img {
          width: 110px;
          height: 110px;
        }
        div {
          font-size: 22px;
          margin-top: 18px;
          font-weight: bold;
        }
      }
    }
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
  .dialog-content {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 8px;
  }
  .dialog-img {
    text-align: center;
    margin-bottom: 12px;
  }
  .dialog-img img {
    width: 350px;
    height: 250px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
}

.orgTableBox,
.popup-table-box {
  min-width: 900px;
  max-width: 1200px;
  max-height: 500px;
  border: 1px solid;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
  overflow: hidden;
}
.popup-table-title {
  background: #fff;
  color: #222;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 16px 0 8px 0;
  margin-bottom: 0;
}
.popup-table {
  width: 100%;
  background: #fff;
  color: #222;
  border-collapse: collapse;
}
.popup-table th,
.popup-table td {
  text-align: center;
  vertical-align: middle;
  padding: 8px 6px;
  background: #fff;
  color: #222;
  white-space: normal;
}
.popup-table th {
  font-weight: bold;
  background: #fff;
  color: #222;
  border-bottom: 2px solid #e0e0e0;
}
.popup-table th.col-name {
  color: #222;
  text-decoration: none;
  min-width: 140px;
  max-width: 200px;
  cursor: default;
}
.popup-table td.col-name {
  color: #1976d2;
  text-decoration: underline;
  min-width: 140px;
  max-width: 200px;
  text-underline-offset: 3px;
  cursor: pointer;
}
.col-leader {
  min-width: 110px;
  max-width: 160px;
  white-space: nowrap;
}
.col-founded {
  min-width: 90px;
  max-width: 120px;
  white-space: nowrap;
}
.region-popup {
  position: relative;
  display: inline-block;
  width: auto;
  max-width: 700px;
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
  overflow-x: auto;
  max-height: 60vh;
  overflow-y: auto;
}
.popup-desc table {
  min-width: 600px;
  width: auto;
  border-collapse: collapse;
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
