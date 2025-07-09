<template>
  <div class="home">
    <!-- <dv-full-screen-container style="position: static"> -->
    <dv-full-screen-container>
      <dv-border-box-11
        title="东方锐眼态势感知中心"
        backgroundColor="#2d3a4b"
        :titleWidth="400"
        class="dv-home-title"
      >
        <div class="container">
          <div class="box left-box">
            <LeftBox :country="selectedCountry" @country-changed="onCountryChanged" />
          </div>
          <div class="box center-box">
            <CenterBox />
          </div>
          <div class="box right-box">
            <RightBox :country="selectedCountry" />
          </div>
        </div>
      </dv-border-box-11>
    </dv-full-screen-container>
  </div>
</template>

<script>
import LeftBox from "../components/LeftBox";
import CenterBox from "../components/CenterBox";
import RightBox from "../components/RightBox";
export default {
  name: "HomeView",
  components: { LeftBox, CenterBox, RightBox },
  data() {
    return {
      selectedCountry: "myanmar", // 默认缅甸
    };
  },
  methods: {
    onCountryChanged(country) {
      this.selectedCountry = country;
    },
  },
};
</script>
<style lang="less" scoped>
.container {
  // display: flex;
  // justify-content: space-between;
  // padding-top: 30px;
  height: 100vh;
  position: relative;
  .box {
    padding: 10px;
    box-sizing: border-box;
    // flex-shrink: 0;
  }
  @topPadding: 46px;
  .left-box {
    width: 520px;
    position: absolute;
    left: 0;
    z-index: 9;
    top: @topPadding;
  }
  .right-box {
    width: 500px;
    position: absolute;
    right: 0;
    top: @topPadding;
    z-index: 9;
  }

  .center-box {
    // flex: 1;
    width: 1920px;
    position: absolute;
    top: @topPadding;
    height: 100vh;
  }
}
.dv-home-title {
  /deep/.dv-border-box-11-title {
    font-size: 24px;
  }
}
</style>
