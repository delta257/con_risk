// 从Overpass API获取铁路数据的脚本
const fs = require('fs');
const https = require('https');

// Overpass API查询语句
const queries = {
  // 中老铁路 (昆明-万象)
  chinaLaosRailway: `
[out:json][timeout:60];
(
  // 中国境内段 (昆明-磨憨)
  way["railway"~"rail|construction"]["name"~"中老铁路|昆玉河铁路|玉磨铁路"](bbox:21.0,100.0,26.0,105.0);
  // 老挝境内段 (磨丁-万象)
  way["railway"~"rail|construction"]["name"~"中老铁路|China-Laos Railway|Boten-Vientiane Railway"](bbox:14.0,100.0,22.0,108.0);
  // 通过关键站点查找
  way["railway"="rail"](around:5000,25.0389,102.7183); // 昆明南站附近
  way["railway"="rail"](around:5000,17.9757,102.6341); // 万象附近
  way["railway"="rail"](around:5000,21.1619,101.6869); // 磨憨/磨丁边境
);
out geom;
`,

  // 中缅铁路 (昆明-皎漂)
  chinaMyanmarRailway: `
[out:json][timeout:60];
(
  // 中国境内段
  way["railway"~"rail|construction|proposed"]["name"~"大瑞铁路|中缅铁路"](bbox:21.0,95.0,26.0,105.0);
  // 缅甸境内段 (规划中)
  way["railway"~"rail|construction|proposed"](bbox:16.0,92.0,26.0,100.0);
  // 通过关键城市查找
  way["railway"="rail"](around:10000,25.0389,102.7183); // 昆明
  way["railway"="rail"](around:10000,24.4037,98.5747); // 大理
  way["railway"="rail"](around:10000,25.1028,98.4951); // 保山
  way["railway"="rail"](around:10000,24.4367,97.8538); // 瑞丽
  way["railway"="rail"](around:10000,21.9588,96.0891); // 曼德勒
  way["railway"="rail"](around:10000,20.1492,92.8702); // 皎漂
);
out geom;
`,

  // 昆明-仰光铁路连接
  kunmingYangonRailway: `
[out:json][timeout:60];
(
  // 缅甸现有铁路网
  way["railway"="rail"](bbox:14.0,92.0,26.0,100.0);
  // 重点关注主要线路
  way["railway"="rail"](around:10000,16.8661,96.1951); // 仰光
  way["railway"="rail"](around:10000,21.9588,96.0891); // 曼德勒
  way["railway"="rail"](around:10000,22.0000,96.6000); // 密支那方向
);
out geom;
`,

  // 泛亚铁路东线 (昆明-新加坡方向)
  panAsianEastLine: `
[out:json][timeout:60];
(
  // 中国-越南-柬埔寨-泰国-马来西亚-新加坡
  way["railway"="rail"](bbox:1.0,100.0,26.0,110.0);
  // 关键节点
  way["railway"="rail"](around:10000,25.0389,102.7183); // 昆明
  way["railway"="rail"](around:10000,21.0285,105.8542); // 河内
  way["railway"="rail"](around:10000,13.7563,100.5018); // 曼谷
  way["railway"="rail"](around:10000,3.1390,101.6869); // 吉隆坡
  way["railway"="rail"](around:10000,1.3521,103.8198); // 新加坡
);
out geom;
`
};

// 发送Overpass查询请求
function queryOverpass(query, filename) {
  return new Promise((resolve, reject) => {
    const postData = query.trim();
    
    const options = {
      hostname: 'overpass-api.de',
      port: 443,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          // 转换为GeoJSON格式
          const geoJson = {
            type: "FeatureCollection",
            features: jsonData.elements.map(element => {
              if (element.type === 'way' && element.geometry) {
                return {
                  type: "Feature",
                  properties: {
                    id: element.id,
                    railway: element.tags?.railway || 'rail',
                    name: element.tags?.name || 'Unknown Railway',
                    operator: element.tags?.operator || '',
                    gauge: element.tags?.gauge || '',
                    electrified: element.tags?.electrified || '',
                    maxspeed: element.tags?.maxspeed || '',
                    usage: element.tags?.usage || '',
                    service: element.tags?.service || '',
                    construction: element.tags?.construction || ''
                  },
                  geometry: {
                    type: "LineString",
                    coordinates: element.geometry.map(coord => [coord.lon, coord.lat])
                  }
                };
              }
              return null;
            }).filter(feature => feature !== null)
          };

          // 保存文件
          fs.writeFileSync(`./src/lib/${filename}`, JSON.stringify(geoJson, null, 2));
          console.log(`✅ ${filename} 数据获取成功，共 ${geoJson.features.length} 条铁路线`);
          resolve(geoJson);
          
        } catch (error) {
          console.error(`❌ 解析 ${filename} 数据失败:`, error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ 请求 ${filename} 失败:`, error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 主函数
async function fetchAllRailwayData() {
  console.log('🚄 开始获取铁路数据...\n');
  
  try {
    // 并发获取所有数据
    const promises = [
      queryOverpass(queries.chinaLaosRailway, 'china_laos_railway.json'),
      queryOverpass(queries.chinaMyanmarRailway, 'china_myanmar_railway.json'),
      queryOverpass(queries.kunmingYangonRailway, 'kunming_yangon_railway.json'),
      queryOverpass(queries.panAsianEastLine, 'pan_asian_east_railway.json')
    ];

    await Promise.all(promises);
    
    console.log('\n🎉 所有铁路数据获取完成！');
    console.log('\n📁 生成的文件：');
    console.log('- china_laos_railway.json (中老铁路)');
    console.log('- china_myanmar_railway.json (中缅铁路)');
    console.log('- kunming_yangon_railway.json (昆明-仰光连接)');
    console.log('- pan_asian_east_railway.json (泛亚铁路东线)');
    
  } catch (error) {
    console.error('❌ 获取数据时发生错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fetchAllRailwayData();
}

module.exports = { fetchAllRailwayData, queryOverpass };