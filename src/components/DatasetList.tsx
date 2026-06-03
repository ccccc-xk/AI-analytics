import { Typography, List, Card, Tag, Button, Popconfirm, Space, Empty } from 'antd'
import { DatabaseOutlined, DeleteOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { Dataset } from '@/types'
import dayjs from 'dayjs'

const { Text } = Typography

interface DatasetListProps {
  datasets: Dataset[]
  loading?: boolean
  onView: (dataset: Dataset) => void
  onDelete: (id: string) => void
}

const DatasetList = ({ datasets, loading, onView, onDelete }: DatasetListProps) => {
  if (datasets.length === 0) {
    return (
      <Empty
        description="暂无数据集，请上传 CSV 文件"
        style={{ padding: '40px 0' }}
      />
    )
  }

  return (
    <List
      loading={loading}
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        lg: 3,
        xl: 4,
      }}
      dataSource={datasets}
      renderItem={(dataset) => (
        <List.Item>
          <Card
            hoverable
            size="small"
            actions={[
              <Button
                key="view"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onView(dataset)}
              >
                查看数据
              </Button>,
              <Popconfirm
                key="delete"
                title="确认删除此数据集？"
                description="删除后数据无法恢复"
                onConfirm={() => onDelete(dataset.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <Card.Meta
              avatar={<DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
              title={dataset.name}
              description={
                <Space direction="vertical" size={4}>
                  <Text type="secondary" ellipsis>
                    文件：{dataset.file_name}
                  </Text>
                  <Space size={8}>
                    <Tag color="blue">{dataset.row_count} 行</Tag>
                    <Tag color="green">{dataset.column_names.length} 列</Tag>
                  </Space>
                  <Space size={4}>
                    <ClockCircleOutlined style={{ fontSize: 12 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(dataset.created_at).format('YYYY-MM-DD HH:mm')}
                    </Text>
                  </Space>
                </Space>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  )
}

export default DatasetList
