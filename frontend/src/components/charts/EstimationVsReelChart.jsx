import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconEqual,
  IconTarget,
  IconReceipt,
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconChartArea
} from '@tabler/icons-react';

const EstimationVsReelChart = ({ 
  affaire, 
  type = 'bar', // 'bar', 'pie', 'line', 'area'
  showComparison = true,
  className = '' 
}) => {
  const chartData = useMemo(() => {
    if (!affaire) return [];

    const data = [
      {
        category: 'Achats',
        estimation: affaire.objectifAchatHt || 0,
        reel: affaire.achatReelHt || 0,
        unite: '€ HT',
        color: '#3b82f6', // Bleu
        colorReel: '#10b981' // Vert
      },
      {
        category: 'CA',
        estimation: affaire.objectifCaHt || 0,
        reel: affaire.caReelHt || 0,
        unite: '€ HT',
        color: '#8b5cf6', // Violet
        colorReel: '#f59e0b' // Orange
      },
      {
        category: 'Heures Fab.',
        estimation: affaire.objectifHeuresFab || 0,
        reel: affaire.heuresReellesFab || 0,
        unite: 'h',
        color: '#ef4444', // Rouge
        colorReel: '#06b6d4' // Cyan
      },
      {
        category: 'Heures Pose',
        estimation: affaire.objectifHeuresPose || 0,
        reel: affaire.heuresReellesPose || 0,
        unite: 'h',
        color: '#f97316', // Orange
        colorReel: '#84cc16' // Lime
      }
    ];

    return data.filter(item => item.estimation > 0 || item.reel > 0);
  }, [affaire]);

  const totals = useMemo(() => {
    const totalEstimation = chartData.reduce((sum, item) => {
      if (item.unite === '€ HT') return sum + item.estimation;
      return sum;
    }, 0);
    
    const totalReel = chartData.reduce((sum, item) => {
      if (item.unite === '€ HT') return sum + item.reel;
      return sum;
    }, 0);

    const ecart = totalReel - totalEstimation;
    const pourcentageEcart = totalEstimation > 0 ? ((ecart / totalEstimation) * 100) : 0;

    return { totalEstimation, totalReel, ecart, pourcentageEcart };
  }, [chartData]);

  const formatValue = (value, unite) => {
    if (unite === '€ HT') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return `${value}${unite}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'estimation' ? 'Estimation' : 'Réel'}: {formatValue(entry.value, data.unite)}
            </p>
          ))}
          {payload.length === 2 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Écart: {formatValue(payload[1].value - payload[0].value, data.unite)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="category" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="estimation" 
          name="Estimation"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="reel" 
          name="Réel"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    const pieData = chartData.flatMap(item => [
      { name: `${item.category} (Est.)`, value: item.estimation, color: item.color },
      { name: `${item.category} (Réel)`, value: item.reel, color: item.colorReel }
    ]).filter(item => item.value > 0);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [
              formatValue(value, name.includes('Achats') || name.includes('CA') ? '€ HT' : 'h'),
              name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="category" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="estimation" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
          name="Estimation"
        />
        <Line 
          type="monotone" 
          dataKey="reel" 
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
          name="Réel"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="category" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="estimation" 
          stackId="1"
          stroke="#3b82f6" 
          fill="#3b82f6"
          fillOpacity={0.6}
          name="Estimation"
        />
        <Area 
          type="monotone" 
          dataKey="reel" 
          stackId="2"
          stroke="#10b981" 
          fill="#10b981"
          fillOpacity={0.6}
          name="Réel"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const getChartIcon = () => {
    switch (type) {
      case 'pie': return <IconChartPie className="w-5 h-5" />;
      case 'line': return <IconChartLine className="w-5 h-5" />;
      case 'area': return <IconChartArea className="w-5 h-5" />;
      default: return <IconChartBar className="w-5 h-5" />;
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'pie': return renderPieChart();
      case 'line': return renderLineChart();
      case 'area': return renderAreaChart();
      default: return renderBarChart();
    }
  };

  if (!chartData.length) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getChartIcon()}
            Comparaison Estimation vs Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <IconTarget className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune donnée disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            {getChartIcon()}
            Comparaison Estimation vs Réel
          </div>
          {showComparison && (
            <div className="flex items-center gap-2 text-sm">
              {totals.pourcentageEcart > 0 ? (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <IconTrendingUp className="w-4 h-4" />
                  +{totals.pourcentageEcart.toFixed(1)}%
                </div>
              ) : totals.pourcentageEcart < 0 ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <IconTrendingDown className="w-4 h-4" />
                  {totals.pourcentageEcart.toFixed(1)}%
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <IconEqual className="w-4 h-4" />
                  0%
                </div>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        {showComparison && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {chartData.map((item, index) => {
              const ecart = item.reel - item.estimation;
              const pourcentage = item.estimation > 0 ? ((ecart / item.estimation) * 100) : 0;
              
              return (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {item.category}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600 dark:text-blue-400">Est.</span>
                      <span className="font-medium">{formatValue(item.estimation, item.unite)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Réel</span>
                      <span className="font-medium">{formatValue(item.reel, item.unite)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500">Écart</span>
                      <span className={`font-medium ${
                        pourcentage > 0 ? 'text-red-600 dark:text-red-400' : 
                        pourcentage < 0 ? 'text-green-600 dark:text-green-400' : 
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {pourcentage > 0 ? '+' : ''}{pourcentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimationVsReelChart; 