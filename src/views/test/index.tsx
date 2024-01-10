import './index.scss'
import {useEffect, useRef} from "react";
import * as echarts from 'echarts';
import mapShanDong from '../../assets/shan_dong.json'

export default function TestPage(){
  const myMapRef = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    myChart.current = echarts.init(myMapRef.current);
    echarts.registerMap('山东省', mapShanDong as any);
    myChart.current.setOption({
      // 图表系列配置
      series: [{
        // 图表类型为3D地图
        type: 'map',

        // 图表名称
        name: '地图',

        // 选择模式为单选
        selectedMode: 'single',

        // 区域高度
        regionHeight: 5,

        // 地图类型，这里是山东省地图
        map: '山东省',

        // 视图控制配置
        viewControl: {
          // 视距距离
          distance: 100,

          // 视角俯仰角度
          alpha: 100,

          // 旋转灵敏度
          rotateSensitivity: [1, 1],
        },

        // 标签配置
        label: {
          // 是否显示标签
          show: true,

          // 标签颜色
          color: '#000000',

          // 标签字体大小
          fontSize: 12,
        },

        // 图形样式配置
        itemStyle: {
          // 图形颜色
          color: '#F7F7F7',

          // 边框宽度
          borderWidth: 1,

          // 边框颜色
          borderColor: '#00B700',

          // 不透明度
          opacity: 1,
        },

        // 高亮样式配置
        emphasis: {
          // 高亮标签配置
          label: {
            // 是否显示高亮标签
            show: true,

            // 高亮标签文字样式
            textStyle: {
              color: '#613727',
            },
          },

          // 高亮图形样式配置
          itemStyle: {
            // 高亮图形颜色
            color: '#FF7F36',

            // 高亮图形边框颜色
            borderColor: '#613727',
          },
        },

        // 光照效果配置
        light: {
          // 主光源配置
          main: {
            // 光源颜色
            color: '#fff',

            // 光源强度
            intensity: 1,

            // 是否显示阴影
            shadow: true,

            // 阴影质量
            shadowQuality: 'high',

            // 光源方向角度
            alpha: 1,

            beta: 10,
          },

          // 环境光配置
          ambient: {
            // 环境光颜色
            color: '#fff',

            // 环境光强度
            intensity: 1,
          },
        },
      }],
    })

    myChart.current.on('click', (e) => {
      console.log('click -> ', e)
    })

    return () => {
      if(!myChart.current) return;
      myChart.current.dispose();
      myChart.current = null;
    }
  }, []);

  return <div className="test-page" >
    <div className="my-map" ref={myMapRef} ></div>
  </div>
}
