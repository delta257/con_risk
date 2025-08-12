// 获取特定铁路线的脚本
const fs = require('fs');
const https = require('https');

// 精确的铁路线查询
const specificQueries = {
  // 中老铁路 (昆明-万象) - 更精确的查询
  chinaLaosRailway: `
[out:json][timeout:90];
(
  // 中老铁路主线
  relation["route"="railway"]["name"~"中老铁路|China-Laos Railway"];
  way["railway"="rail"]["name"~"中老铁路|玉磨铁路"];
  // 关键站点连接
  way["railway"="rail"](around:2000,25.0389,102.7183); // 昆明南站
  way["railway"="rail"](around:2000,23.3569,103.4028); // 普洱站
  way["railway"="rail"](around:2000,21.1619,101.6869); // 磨憨站
  way["railway"="rail"](around:2000,21.1500,101.6800); // 磨丁站(老挝)
  way["railway"="rail"](around:2000,19.8563,102.1354); // 琅勃拉邦
  way["railway"="rail"](around:2000,17.9757,102.6341); // 万象
);
out geom;
`,

  // 中缅铁路 (昆明-皎漂) - 包括规划和在建段
  chinaMyanmarRailway: `
[out:json][timeout:90];
(
  // 大瑞铁路 (昆明-大理-瑞丽)
  way["railway"~"rail|construction"]["name"~"大瑞铁路"];
  relation["route"="railway"]["name"~"大瑞铁路"];
  // 关键节点
  way["railway"~"rail|construction"](around:5000,25.0389,102.7183); // 昆明
  way["railway"~"rail|construction"](around:5000,25.5969,100.2417); // 楚雄
  way["railway"~"rail|construction"](around:5000,25.6066,100.2692); // 大理
  way["railway"~"rail|construction"](around:5000,25.1028,98.4951); // 保山
  way["railway"~"rail|construction"](around:5000,24.4367,97.8538); // 瑞丽
  // 缅甸境内规划线路
  way["railway"~"rail|construction|proposed"](around:10000,24.4367,97.8538); // 瑞丽-木姐
  way["railway"~"rail|construction|proposed"](around:10000,21.9588,96.0891); // 曼德勒
  way["railway"~"rail|construction|proposed"](around:10000,20.1492,92.8702); // 皎漂
);
out geom;
`,

  // 昆明-仰光铁路连接 (经曼德勒)
  kunmingYangonConnection: `
[out:json][timeout:90];
(
  // 缅甸现有铁路主干线
  way["railway"="rail"]["name"~"Yangon|Mandalay|Myanmar Railways"];
  // 主要城市间连接
  way["railway"="rail"](around:5000,16.8661,96.1951); // 仰光
  way["railway"="rail"](around:5000,19.7633,96.0785); // 彬乌伦
  way["railway"="rail"](around:5000,21.9588,96.0891); // 曼德勒
  way["railway"="rail"](around:5000,22.0000,96.6000); // 密支那方向
  // 仰光-曼德勒主线
  way["railway"="rail"](bbox:16.5,95.5,22.5,97.0);
);
out geom;
`
};

// 发送查询请求
function queryOverpass(query, filename, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔍 正在获取 ${description}...`);
    
    const postData = query.trim();
    
    const options = {
      hostname: 'overpass-api.de',
      port: 443,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Railway Data Fetcher'
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
          
          if (!jsonData.elements || jsonData.elements.length === 0) {
            console.log(`⚠️  ${description} 未找到数据`);
            resolve({ features: [] });
            return;
          }

          // 转换为GeoJSON格式
          const geoJson = {
            type: "FeatureCollection",
            metadata: {
              description: description,
              query_time: new Date().toISOString(),
              total_elements: jsonData.elements.length
            },
            features: jsonData.elements
              .filter(element => element.type === 'way' && element.geometry)
              .map(element => ({
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
                  construction: element.tags?.construction || '',
                  ref: element.tags?.ref || '',
                  description: element.tags?.description || ''
                },
                geometry: {
                  type: "LineString",
                  coordinates: element.geometry.map(coord => [coord.lon, coord.lat])
                }
              }))
          };

          // 保存文件
          fs.writeFileSync(`./src/lib/${filename}`, JSON.stringify(geoJson, null, 2));
          console.log(`✅ ${description} 获取成功，共 ${geoJson.features.length} 条铁路段`);
          
          // 显示一些关键信息
          const namedRailways = geoJson.features.filter(f => f.properties.name !== 'Unknown Railway');
          if (namedRailways.length > 0) {
            console.log(`   📍 包含命名铁路: ${[...new Set(namedRailways.map(f => f.properties.name))].slice(0, 3).join(', ')}`);
          }
          
          resolve(geoJson);
          
        } catch (error) {
          console.error(`❌ 解析 ${description} 数据失败:`, error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ 请求 ${description} 失败:`, error.message);
      reject(error);
    });

    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error(`请求 ${description} 超时`));
    });

    req.write(postData);
    req.end();
  });
}

// 主函数
async function fetchSpecificRailways() {
  console.log('🚄 开始获取特定铁路线数据...\n');
  
  const railways = [
    {
      query: specificQueries.chinaLaosRailway,
      filename: 'kunming_vientiane_railway.json',
      description: '昆明-万象铁路 (中老铁路)'
    },
    {
      query: specificQueries.chinaMyanmarRailway,
      filename: 'kunming_kyaukpyu_railway.json',
      description: '昆明-皎漂铁路 (中缅铁路)'
    },
    {
      query: specificQueries.kunmingYangonConnection,
      filename: 'kunming_yangon_connection.json',
      description: '昆明-仰光铁路连接'
    }
  ];

  try {
    for (const railway of railways) {
      await queryOverpass(railway.query, railway.filename, railway.description);
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 特定铁路线数据获取完成！');
    console.log('\n📁 生成的文件：');
    console.log('- kunming_vientiane_railway.json (昆明-万象，中老铁路)');
    console.log('- kunming_kyaukpyu_railway.json (昆明-皎漂，中缅铁路)');
    console.log('- kunming_yangon_connection.json (昆明-仰光连接)');
    
  } catch (error) {
    console.error('❌ 获取数据时发生错误:', error.message);
  }
}

// 运行脚本
if (require.main === module) {
  fetchSpecificRailways();
}

module.exports = { fetchSpecificRailways };