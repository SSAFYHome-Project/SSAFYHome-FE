import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
  } from 'recharts'
  
  interface ChartItem {
    date: string
    price: number
  }
  
  interface PriceChartProps {
    data: ChartItem[]
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-price">{`${payload[0].value}억`}</p>
        </div>
      )
    }
    return null
  }  
  
  const PriceChart = ({ data }: PriceChartProps) => {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis unit="억" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3182F6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
  
  export default PriceChart
  