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
          <dv-decoration-7 style="width: 200px; height: 30px">
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
      <div class="text-dialog" @click.stop>
        <div class="title">{{ rowData.name }}</div>
        <div v-if="rowData.img" class="dialog-img">
          <img :src="rowData.img.startsWith('http') ? rowData.img : (rowData.img.startsWith('/') ? rowData.img : '/' + rowData.img)" alt="图片" />
        </div>
        <div v-html="rowData.detail" class="dialog-content"></div>
      </div>
    </TextDialog>
    <TextDialog ref="textDialogRef2">
      <div class="orgTableBox">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>组织名称</th>
              <th>组织宗旨</th>
              <th>成立时间</th>
              <th>活动地点</th>
              <th>典型活动</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fItem, index) in currentOrgs">
              <td>{{ index + 1 }}</td>
              <td>{{ fItem.orgName }}</td>
              <td>{{ fItem.orgPurpose }}</td>
              <td>{{ fItem.createTime }}</td>
              <td>{{ fItem.activityArea }}</td>
              <td>{{ fItem.activity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </TextDialog>
    <TextDialog ref="hostInfoDialogRef">
      <div class="text-dialog" @click.stop>
        <div class="title">{{ hostInfoRowData.name }}</div>
        <div v-if="hostInfoRowData.img" class="dialog-img">
          <img :src="require(`@/${hostInfoRowData.img}`)" alt="图片" />
        </div>
        <div v-html="hostInfoRowData.detail" class="dialog-content"></div>
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
        // { id: 1, name: "生态", ngoInfo: [] },
        // { id: 2, name: "人权", ngoInfo: [] },
        { id: 3, name: "政党", ngoInfo: [] },
        { id: 4, name: "武装", ngoInfo: [] },
        { id: 5, name: "劳工", ngoInfo: [] },
        { id: 6, name: "宗教", ngoInfo: [] },
      ],
      orgs: [],
      projects: [],
      currentIndustryIndex: 0,
      hostInfoList: [
        { id: 1, name: "国家概况", src: iconSvg1, detail: "<p>这里是国家概况的详细介绍。</p>" },
        { id: 2, name: "对外关系", src: iconSvg2, detail: "<p>这里是对外关系的详细介绍。</p>" },
        { id: 3, name: "民族宗教", src: iconSvg3, detail: "<p>这里是民族宗教的详细介绍。</p>" },
        { id: 4, name: "政党政治", src: iconSvg4, detail: "<p>这里是政党政治的详细介绍。</p>" },
        { id: 5, name: "经济环境", src: iconSvg5, detail: "<p>这里是经济环境的详细介绍。</p>" },
        { id: 6, name: "营商环境", src: iconSvg6, detail: "<p>这里是营商环境的详细介绍。</p>" },
      ],
      localEvents: [
        { id: 1, name: "电诈" },
        { id: 2, name: "缅北冲突" },
        { id: 3, name: "华人区" },
        { id: 4, name: "缅甸旅行" },
      ],
      rowData: {},
      currentOrgs: [],
      riskData: {},
      hostInfoRowData: {}, // 新增
    };
  },
  watch: {
    country: {
      immediate: true,
      handler(newVal) {
        if (newVal === "myanmar") {
          this.riskData = riskMyanmar;
          import("../json/orgs.json").then(m => { this.orgs = m.default; });
          this.projects = myanmarProvinces.map((item, idx) => ({ ...item, id: idx + 1, name: item.name_zh }));
        } else if (newVal === "laos") {
          this.riskData = riskLaos;
          import("../json/orgs_laos.json").then(m => { this.orgs = m.default; });
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
      this.currentOrgs = this.orgs.filter((i) => i.type == row.name);
      this.$refs.textDialogRef2 && this.$refs.textDialogRef2.showDialog();
    },
    showHostInfoDialog(item) { // 新增
      this.hostInfoRowData = { ...item };
      this.$refs.hostInfoDialogRef && this.$refs.hostInfoDialogRef.showDialog();
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
        height: 200px;
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
    height: 350px;
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
      grid-template-rows: repeat(2, 1fr);
      grid-column-gap: 10px;
      grid-row-gap: 10px;
      padding: 15px;
      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        img {
          width: 70px;
          height: 75px;
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

.orgTableBox {
  min-width: 900px;
  max-width: 1200px;
  max-height: 500px;
  border: 1px solid;
  border-radius: 20px;
  table {
    tr {
      height: 40px;
    }
    th {
      text-align: left;
      padding: 0 8px;
    }
    td {
      text-align: left;
      padding: 0 8px;
    }
  }
}
</style>
