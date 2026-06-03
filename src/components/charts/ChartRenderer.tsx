import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { ChartType } from '@/types'
import { Empty, Alert } from 'antd'

interface ChartRendererProps {
  chartType: ChartType
  title: string
  xData: (string | number)[]
  yData: (string | number)[]
  xLabel: string
  yLabel: string
  style?: React.CSSProperties
}

interface ChartRendererState {
  hasError: boolean
  errorMsg: string
}

class ChartRenderer extends React.Component<ChartRendererProps, ChartRendererState> {
  constructor(props: ChartRendererProps) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('[ChartRenderer] Error:', error)
  }

  componentDidUpdate(prevProps: ChartRendererProps) {
    if (
      this.state.hasError &&
      (prevProps.chartType !== this.props.chartType ||
        prevProps.xData !== this.props.xData ||
        prevProps.yData !== this.props.yData)
    ) {
      this.setState({ hasError: false, errorMsg: '' })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          type="error"
          message="图表渲染出错"
          description={this.state.errorMsg}
          showIcon
        />
      )
    }

    const { chartType, title, xData, yData, xLabel, yLabel, style } = this.props

    if (!xData.length || !yData.length) {
      return <Empty description="暂无数据" />
    }

    // Build toolbox features based on chart type
    const toolboxFeatures: Record<string, unknown> = {
      saveAsImage: {
        show: true,
        title: '保存图片',
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      },
      dataView: {
        show: true,
        title: '数据视图',
        readOnly: true,
        lang: ['数据视图', '关闭', '刷新'],
      },
      restore: {
        show: true,
        title: '还原',
      },
    }
    if (chartType !== 'pie') {
      toolboxFeatures.dataZoom = {
        show: true,
        title: { zoom: '区域缩放', back: '区域缩放还原' },
      }
    }

    const getOption = () => {
      const baseOption: Record<string, unknown> = {
        title: {
          text: title,
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 600 },
        },
        tooltip: {
          trigger: chartType === 'pie' ? 'item' : 'axis',
          confine: true,
          formatter: chartType === 'pie' ? '{b}: {c} ({d}%)' : undefined,
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          right: 20,
          top: 10,
          itemSize: 16,
          itemGap: 10,
          feature: toolboxFeatures,
        },
      }

      if (chartType === 'pie') {
        const pieData = xData.map((name, index) => ({
          name: String(name),
          value: Number(yData[index]) || 0,
        }))

        return {
          ...baseOption,
          legend: {
            orient: 'vertical',
            left: 10,
            top: 'middle',
            type: 'scroll',
          },
          series: [{
            name: title,
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['55%', '55%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 3,
            },
            label: {
              show: true,
              formatter: '{b}\n{d}%',
              fontSize: 12,
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10,
            },
            emphasis: {
              label: { show: true, fontSize: 14, fontWeight: 'bold' },
            },
            data: pieData,
          }],
        }
      }

      if (chartType === 'line') {
        return {
          ...baseOption,
          grid: { left: '5%', right: '5%', bottom: '15%', top: '15%', containLabel: true },
          xAxis: {
            type: 'category',
            data: xData.map(String),
            name: xLabel,
            axisLabel: { rotate: xData.length > 10 ? 30 : 0, fontSize: 11 },
            nameLocation: 'middle',
            nameGap: 55,
          },
          yAxis: {
            type: 'value',
            name: yLabel,
            nameLocation: 'middle',
            nameGap: 65,
          },
          series: [{
            name: yLabel,
            type: 'line',
            data: yData.map((v) => Number(v) || 0),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2.5 },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                  { offset: 1, color: 'rgba(64, 158, 255, 0.02)' },
                ],
              },
            },
            emphasis: { focus: 'series' },
          }],
          dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20 },
          ],
        }
      }

      // bar chart
      return {
        ...baseOption,
        grid: { left: '5%', right: '5%', bottom: '15%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: xData.map(String),
          name: xLabel,
          axisLabel: { rotate: xData.length > 8 ? 45 : 0, fontSize: 11 },
          nameLocation: 'middle',
          nameGap: 55,
        },
        yAxis: {
          type: 'value',
          name: yLabel,
          nameLocation: 'middle',
          nameGap: 65,
        },
        series: [{
          name: yLabel,
          type: 'bar',
          data: yData.map((v) => Number(v) || 0),
          barMaxWidth: 40,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          emphasis: {
            focus: 'series',
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
          },
        }],
        dataZoom: [
          { type: 'inside', start: 0, end: 100 },
          { type: 'slider', start: 0, end: 100, height: 20 },
        ],
      }
    }

    return (
      <ReactECharts
        option={getOption()}
        style={{ height: 420, width: '100%', ...style }}
        notMerge={true}
        lazyUpdate={false}
      />
    )
  }
}

export default ChartRenderer
