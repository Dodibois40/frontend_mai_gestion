import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconEqual
} from '@tabler/icons-react';
import { formatCurrency } from '@/utils/affaires';
import { getCategoriesAchat } from '@/services/categorieAchatService';

export const ComparaisonChartSection = ({ 
  montantTotalEstime,
  categoriesEstimation,
  syntheseAchatsRealises,
  chartType,
  onChartTypeChange,
  showChart,
  onToggleChart
}) => {

  const getComparaisonIcon = (estime, reel) => {
    if (reel > estime * 1.1) {
      return <IconTrendingUp size={16} color="red" title="Dépassement" />;
    } else if (reel < estime * 0.9) {
      return <IconTrendingDown size={16} color="green" title="Économie" />;
    } else {
      return <IconEqual size={16} color="blue" title="Conforme" />;
    }
  };

  // Préparation des données pour les graphiques
  const chartData = useMemo(() => {
    if (!syntheseAchatsRealises || syntheseAchatsRealises.length === 0) return [];
    
    return syntheseAchatsRealises.map(categorie => ({
      nom: categorie.nom,
      estime: categorie.montantEstime,
      reel: categorie.totalReel,
      ecart: categorie.ecart,
      pourcentage: categorie.pourcentageRealisation
    }));
  }, [syntheseAchatsRealises]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
          {payload.length >= 2 && (
            <p className="text-sm font-medium border-t border-gray-200 pt-1 mt-1">
              Écart: {formatCurrency(payload[1].value - payload[0].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!showChart || chartData.length === 0) return null;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="nom" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="estime" fill="#3b82f6" name="Estimé" />
              <Bar dataKey="reel" fill="#10b981" name="Réel" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = chartData.map((item, index) => ({
          ...item,
          fill: `hsl(${index * 45}, 70%, 60%)`
        }));
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nom, reel, percent }) => `${nom}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="reel"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="nom" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="estime" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Estimé"
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
      
      default:
        return null;
    }
  };

  if (!showChart) {
    return (
      <div className="text-center py-6">
        <button
          onClick={() => onToggleChart(true)}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
        >
          📊 Afficher les Graphiques de Comparaison
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            📊 Comparaison Estimation vs Réel
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={chartType}
              onChange={(e) => onChartTypeChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value="bar">Barres</option>
              <option value="pie">Camembert</option>
              <option value="area">Aires</option>
            </select>
            <button
              onClick={() => onToggleChart(false)}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {chartData.length > 0 ? (
          <>
            {renderChart()}
            
            {/* Tableau de synthèse */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Catégorie</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Estimé</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Réel</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Écart</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Tendance</th>
                  </tr>
                </thead>
                <tbody>
                  {syntheseAchatsRealises.map((categorie) => (
                    <tr key={categorie.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-3 text-gray-900 dark:text-white">{categorie.nom}</td>
                      <td className="py-2 px-3 text-right text-blue-600 dark:text-blue-400">
                        {formatCurrency(categorie.montantEstime)}
                      </td>
                      <td className="py-2 px-3 text-right text-green-600 dark:text-green-400">
                        {formatCurrency(categorie.totalReel)}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${
                        categorie.ecart > 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : categorie.ecart < 0 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {categorie.ecart > 0 ? '+' : ''}{formatCurrency(categorie.ecart)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {getComparaisonIcon(categorie.montantEstime, categorie.totalReel)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <div>Aucune donnée disponible pour la comparaison</div>
            <div className="text-sm mt-1">
              Les données apparaîtront lorsque des achats seront saisis
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparaisonChartSection; 