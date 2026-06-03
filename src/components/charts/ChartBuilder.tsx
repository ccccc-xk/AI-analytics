import { Card, Select, Input, Button, Space, Typography, Tag, Empty, Tooltip, Alert } from 'antd'
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ClearOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import ChartRenderer from './ChartRenderer'
import type { Dataset, DataRow } from '@/types'
import { useCharts } from '@/hooks/useCharts'
import type { ColumnMeta } from '@/hooks/useCharts'

const { Title, Text } = Typography

interface ChartBuilderProps {
  dataset: Dataset
  dataRows: DataRow[]
}

const chartTypeOptions = [
  { value: 'line' as const, label: '折线图', icon: <LineChartOutlined /> },
  { value: 'bar' as const, label: '柱状图', icon: <BarChartOutlined /> },
  { value: 'pie' as const, label: '饼图', icon: <PieChartOutlined /> },
]

const kindColor: Record<string, string> = {
  category: 'blue',
  date: 'cyan',
  numeric: 'green',
  id: 'default',
}

function buildOptions(metaList: ColumnMeta[]) {
  return metaList.map((m) => ({
    value: m.name,
    label: (
      <span>
        {m.name}
        <Tag color={kindColor[m.kind] || 'default'} style={{ marginLeft: 8, fontSize: 11 }}>
          {m.kind === 'category' ? '分类' : m.kind === 'date' ? '日期' : m.kind === 'numeric' ? '数值' : '编号'}
        </Tag>
        <span style={{ color: '#999', fontSize: 11 }}>{m.uniqueCount}项</span>
      </span>
    ),
  }))
}

const ChartBuilder = ({ dataset, dataRows }: ChartBuilderProps) => {
  const {
    draft,
    savedCharts,
    xAxisMeta,
    yAxisMeta,
    chartData,
    isValid,
    pieOvercrowded,
    updateDraft,
    resetDraft,
    saveChart,
    removeChart,
  } = useCharts(dataRows, dataset)

  const xAxisOptions = buildOptions(xAxisMeta)
  const yAxisOptions = buildOptions(yAxisMeta)


  return (
    <div>
      {/* Config area */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <PlusOutlined style={{ marginRight: 8 }} />
          创建图表
        </Title>

        {/* Chart title */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>图表标题</Text>
          <Input
            placeholder="输入图表标题，如：月度销售额"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            allowClear
          />
        </div>

        {/* Chart type */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>图表类型</Text>
          <Space>
            {chartTypeOptions.map((opt) => (
              <Button
                key={opt.value}
                icon={opt.icon}
                type={draft.chartType === opt.value ? 'primary' : 'default'}
                onClick={() => updateDraft({ chartType: opt.value })}
              >
                {opt.label}
              </Button>
            ))}
          </Space>
        </div>

        {/* X axis */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            {draft.chartType === 'pie' ? '分类字段（标签）' : 'X 轴（横轴）'}
          </Text>
          {xAxisOptions.length > 0 ? (
            <Select
              style={{ width: '100%' }}
              placeholder={draft.chartType === 'pie' ? '选择一个分类字段' : '选择一个分类或日期字段'}
              key={`x-${draft.xColumn}`}
              value={draft.xColumn || undefined}
              onChange={(val: string) => updateDraft({ xColumn: val || '' })}
              options={xAxisOptions}
              allowClear
              showSearch
              optionFilterProp="children"
            />
          ) : (
            <Text type="secondary">{draft.chartType === 'pie' ? '暂无可用列' : '暂无可用列'}</Text>
          )}
          {draft.chartType === 'pie' && (
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              所有列均可作为分类标签，建议选择分类意义明确的列
            </Text>
          )}
        </div>

        {/* Pie overcrowded warning */}
        {pieOvercrowded && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="该分类字段唯一值较多（>20），饼图可能不够清晰，建议换一个分类较少的字段"
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Y axis */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            {draft.chartType === 'pie' ? '数值字段（大小）' : 'Y 轴（纵轴）'}
          </Text>
          <Select
            style={{ width: '100%' }}
            placeholder={'选择一个字段'}
            key={`y-${draft.yColumn}`}
            value={draft.yColumn || undefined}
            onChange={(val: string) => updateDraft({ yColumn: val || '' })}
            options={yAxisOptions}
            allowClear
            showSearch
            optionFilterProp="children"
          />

        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button icon={<ClearOutlined />} onClick={resetDraft}>
            重置
          </Button>
          <Tooltip title={!isValid ? '请先选择 X 轴和 Y 轴字段' : ''}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => {
                if (!draft.title) {
                  const typeLabel = draft.chartType === 'pie' ? '饼图' : draft.chartType === 'line' ? '折线图' : '柱状图'
                  updateDraft({ title: `${typeLabel} - ${draft.yColumn}` })
                }
                saveChart()
              }}
              disabled={!isValid}
            >
              保存图表
            </Button>
          </Tooltip>
        </div>
      </Card>

      {/* Real-time preview */}
      {isValid ? (
        <Card style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            实时预览
          </Title>
          <ChartRenderer
            chartType={draft.chartType}
            title={draft.title || '预览图表'}
            xData={chartData.xData}
            yData={chartData.yData}
            xLabel={draft.xColumn}
            yLabel={draft.yColumn}
          />
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <Tag color="blue">数据量：{chartData.xData.length} 条</Tag>
            {draft.chartType === 'pie' && chartData.xData.length >= 10 && (
              <Tag color="orange">已自动归类 Top 10</Tag>
            )}
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 24, textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            请选择 X 轴和 Y 轴字段后，图表预览将在此显示
          </Text>
        </Card>
      )}

      {/* Saved charts */}
      {savedCharts.length > 0 && (
        <Card>
          <Title level={5} style={{ marginBottom: 16 }}>
            已保存的图表（{savedCharts.length}）
          </Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {savedCharts.map((chart, index) => {
              let sxData: (string | number)[] = []
              let syData: (string | number)[] = []

              if (chart.chartType === 'pie') {
                const groups = new Map<string, number>()
                dataRows.forEach((row) => {
                  const key = String(row.row_data[chart.xColumn] ?? '未知')
                  const val = Number(row.row_data[chart.yColumn]) || 0
                  groups.set(key, (groups.get(key) || 0) + val)
                })
                const sorted = [...groups.entries()].sort((a, b) => b[1] - a[1])
                const top = sorted.slice(0, 10)
                if (sorted.length > 10) {
                  top.push(['其他', sorted.slice(10).reduce((s, e) => s + e[1], 0)])
                }
                sxData = top.map(([k]) => k)
                syData = top.map(([, v]) => v)
              } else {
                dataRows.forEach((row) => {
                  const x = row.row_data[chart.xColumn]
                  const y = row.row_data[chart.yColumn]
                  if (x !== undefined && x !== null && y !== undefined && y !== null) {
                    sxData.push(String(x))
                    syData.push(Number(y) || 0)
                  }
                })
              }

              return (
                <Card
                  key={index}
                  size="small"
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeChart(index)}
                    >
                      删除
                    </Button>
                  }
                >
                  <ChartRenderer
                    chartType={chart.chartType}
                    title={chart.title}
                    xData={sxData}
                    yData={syData}
                    xLabel={chart.xColumn}
                    yLabel={chart.yColumn}
                    style={{ height: 320 }}
                  />
                </Card>
              )
            })}
          </div>
        </Card>
      )}

      {/* No data hint */}
      {!dataRows.length && (
        <Empty description="请先上传数据，然后才能创建图表" />
      )}
    </div>
  )
}

export default ChartBuilder
