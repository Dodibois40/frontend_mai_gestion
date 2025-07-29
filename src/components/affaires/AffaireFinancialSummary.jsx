import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  IconTarget,
  IconTrendingUp,
  IconCurrencyEuro,
  IconShoppingCart,
  IconBuildingFactory,
  IconCalculator,
  IconClock,
  IconChartPie,
  IconActivity,
  IconArrowUpRight,
  IconArrowDownRight
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const AffaireFinancialSummary = ({ affaire, financialData }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    return `${Math.round(value)}%`;
  };

  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return '0,0h';
    return `${hours.toFixed(1)}h`;
  };

  // Palette "Terre et Chêne"
  const COLORS = {
    achats: '#d97706',       // Amber 600
    mainOeuvre: '#FFC107',   // Jaune soleil
    fraisGeneraux: '#65a30d',// Lime 600
    marge: '#059669',        // Emerald 600 (vert contrastant)
    ca: '#d97706',           // Amber 600
    prevu: '#007AFF',        // Bleu Apple primary
    realise: '#8B9B7A',      // Vert olive subtil
  };

  // Données pour le graphique de comparaison Prévisions vs Réalisé
  const comparisonData = [
    {
      name: 'CA',
      prevu: financialData.objectifCA || 0,
      realise: financialData.caReel || 0,
      color: COLORS.ca
    },
    {
      name: 'Achats',
      prevu: financialData.objectifAchats || 0,
      realise: financialData.achatReel || 0,
      color: COLORS.achats
    },
    {
      name: 'Main-d\'œuvre',
      prevu: financialData.coutObjectifMainOeuvre || 0,
      realise: financialData.totalMainOeuvreReelle || 0,
      color: COLORS.mainOeuvre
    },
    {
      name: 'Marge',
      prevu: financialData.margeObjectif || 0,
      realise: financialData.margeReelle || 0,
      color: COLORS.marge
    }
  ];

  // Données pour le camembert Répartition Prévue
  const repartitionPrevueData = [
    {
      name: 'Achats',
      value: financialData.objectifAchats || 0,
      color: COLORS.achats,
      percentage: financialData.objectifCA > 0 ? ((financialData.objectifAchats || 0) / financialData.objectifCA * 100) : 0
    },
    {
      name: 'Main-d\'œuvre',
      value: financialData.coutObjectifMainOeuvre || 0,
      color: COLORS.mainOeuvre,
      percentage: financialData.objectifCA > 0 ? ((financialData.coutObjectifMainOeuvre || 0) / financialData.objectifCA * 100) : 0
    },
    {
      name: 'Frais généraux',
      value: financialData.fraisGenerauxObjectifs || 0,
      color: COLORS.fraisGeneraux,
      percentage: financialData.objectifCA > 0 ? ((financialData.fraisGenerauxObjectifs || 0) / financialData.objectifCA * 100) : 0
    },
    {
      name: 'Marge',
      value: financialData.margeObjectif || 0,
      color: COLORS.marge,
      percentage: financialData.objectifCA > 0 ? ((financialData.margeObjectif || 0) / financialData.objectifCA * 100) : 0
    }
  ].filter(item => item.value > 0);

  // Données pour le camembert Répartition Réelle - MODIFIÉ pour toujours afficher les achats
  const repartitionReelleData = (() => {
    const margeReelle = financialData.margeReelle || 0;
    const caReel = financialData.caReel || 0;
    
    // Construire les données de base (achats toujours affiché, même à 0)
    const baseData = [
      {
        name: 'Achats',
        value: financialData.achatReel || 0,
        color: COLORS.achats,
        percentage: caReel > 0 ? ((financialData.achatReel || 0) / caReel * 100) : 0
      },
      {
        name: 'Main-d\'œuvre',
        value: financialData.totalMainOeuvreReelle || 0,
        color: COLORS.mainOeuvre,
        percentage: caReel > 0 ? ((financialData.totalMainOeuvreReelle || 0) / caReel * 100) : 0
      },
      {
        name: 'Frais généraux',
        value: financialData.fraisGenerauxReels || 0,
        color: COLORS.fraisGeneraux,
        percentage: caReel > 0 ? ((financialData.fraisGenerauxReels || 0) / caReel * 100) : 0
      }
    ];

    // Ajouter la marge SEULEMENT si elle est positive
    if (margeReelle > 0) {
      baseData.push({
        name: 'Marge',
        value: margeReelle,
        color: COLORS.marge,
        percentage: caReel > 0 ? (margeReelle / caReel * 100) : 0
      });
    }

    // Ne filtrer que les données autres que les achats pour les valeurs > 0
    return baseData.map(item => {
      if (item.name === 'Achats') {
        return item; // Toujours garder les achats même à 0
      }
      return item.value > 0 ? item : null;
    }).filter(Boolean);
  })();

  // Calculer si on a une marge négative pour l'affichage séparé
  const margeNegative = (financialData.margeReelle || 0) < 0 ? Math.abs(financialData.margeReelle) : 0;
  const pourcentageMargeNegative = financialData.caReel > 0 ? ((financialData.margeReelle || 0) / financialData.caReel * 100) : 0;

  // Tooltip personnalisé moderne
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-stone-200 rounded-xl shadow-xl p-3">
          <p className="font-bold text-stone-800 mb-2 flex items-center">
             <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: data.color, marginRight: '8px' }}></span>
            {data.name}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Valeur:</span>
              <span className="font-bold text-stone-800">
                {formatCurrency(data.value)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Pourcentage:</span>
              <span className="font-semibold text-amber-700">
                {formatPercentage(data.percentage)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label pour les pourcentages sur les graphiques avec accès au nom
  const renderCustomLabelWithName = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } = props;
    const name = payload?.name || '';
    
    // Forcer l'affichage pour les achats même si petits, sinon seuil à 0.5%
    const shouldShow = name === 'Achats' || percent >= 0.005;
    if (!shouldShow) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="font-bold text-sm drop-shadow-lg"
        style={{ 
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontSize: name === 'Achats' && percent < 0.01 ? '14px' : '16px' // Taille plus petite pour les très petites tranches
        }}
      >
        {`${(percent * 100).toFixed(percent < 0.01 ? 1 : 0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section des camemberts côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camembert Répartition Prévue */}
        <Card className="bg-white shadow-lg rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-stone-800">
              <div className="p-2 bg-amber-100 rounded-lg">
                <IconTarget className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-lg font-bold">Répartition Prévue</span>
                <div className="text-sm font-normal text-stone-500">
                  CA Objectif: {formatCurrency(financialData.objectifCA)}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repartitionPrevueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabelWithName}
                    outerRadius={120}
                    innerRadius={0}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionPrevueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#44403c' // stone-700
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Détails ligne par ligne pour la répartition prévue */}
            <div className="mt-6 space-y-3">
              <div className="text-sm font-semibold text-stone-700 border-b border-stone-200 pb-2">
                📊 Détail de la répartition prévue
              </div>
              {repartitionPrevueData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium text-stone-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-800">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-stone-600">{formatPercentage(item.percentage)}</div>
                  </div>
                </div>
              ))}
              
              {/* Total ligne */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-600 shadow-sm"></div>
                  <span className="font-bold text-amber-800">Total CA Objectif</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-900">{formatCurrency(financialData.objectifCA)}</div>
                  <div className="text-sm text-amber-700">100%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camembert Répartition Réelle */}
        <Card className="bg-white shadow-lg rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-stone-800">
              <div className="p-2 bg-lime-100 rounded-lg">
                <IconTrendingUp className="w-5 h-5 text-lime-600" />
              </div>
              <div>
                <span className="text-lg font-bold">Répartition Réelle</span>
                <div className="text-sm font-normal text-stone-500">
                  CA Réalisé: {formatCurrency(financialData.caReel)}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Alerte pour marge négative */}
            {margeNegative > 0 && (
              <div className="px-6 pb-4 -mt-4">
                <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                  <p className="text-sm font-semibold text-orange-800">
                    Perte (marge négative): {formatCurrency(margeNegative)}
                    <span className="text-orange-600 ml-2">({formatPercentage(pourcentageMargeNegative)})</span>
                  </p>
                </div>
              </div>
            )}
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repartitionReelleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabelWithName}
                    outerRadius={120}
                    innerRadius={0}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionReelleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#44403c' // stone-700
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Note explicative pour marge négative */}
            {margeNegative > 0 && (
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                💡 Le camembert montre la répartition des coûts. La marge négative est affichée séparément car elle représente un déficit.
              </div>
            )}

            {/* Note explicative pour achats très petits */}
            {financialData.achatReel > 0 && financialData.caReel > 0 && (financialData.achatReel / financialData.caReel) < 0.02 && (
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 Les achats ({formatCurrency(financialData.achatReel)}) représentent {formatPercentage((financialData.achatReel / financialData.caReel) * 100)} du CA. 
                Cette proportion très faible explique leur visualisation réduite sur le camembert.
              </div>
            )}
            
            {/* Détails ligne par ligne pour la répartition réelle */}
            <div className="mt-6 space-y-3">
              <div className="text-sm font-semibold text-stone-700 border-b border-stone-200 pb-2">
                📊 Détail de la répartition réelle
              </div>
              
              {/* Affichage des éléments du camembert */}
              {repartitionReelleData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium text-stone-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-800">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-stone-600">{formatPercentage(item.percentage)}</div>
                  </div>
                </div>
              ))}
              
              {/* Affichage séparé de la marge négative si elle existe */}
              {margeNegative > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
                    <span className="font-medium text-red-700">Perte (marge négative)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-800">-{formatCurrency(margeNegative)}</div>
                    <div className="text-sm text-red-600">{formatPercentage(pourcentageMargeNegative)}</div>
                  </div>
                </div>
              )}
              
              {/* Total ligne */}
              <div className="flex items-center justify-between p-3 bg-lime-50 rounded-lg border border-lime-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-lime-600 shadow-sm"></div>
                  <span className="font-bold text-lime-800">Total CA Réalisé</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lime-900">{formatCurrency(financialData.caReel)}</div>
                  <div className="text-sm text-lime-700">100%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section de comparaison Prévisions vs Réalisé - maintenant en second */}
      <Card className="bg-white shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-stone-800">
            <div className="p-2 bg-lime-100 rounded-lg">
              <IconActivity className="w-5 h-5 text-lime-600" />
            </div>
            <div>
              <span className="text-lg font-bold">Prévu vs. Réalisé</span>
              <div className="text-sm font-normal text-stone-600">
                Comparaison des indicateurs clés
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fill: '#57534e' }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: '#57534e' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                />
                <Bar dataKey="prevu" fill={COLORS.prevu} name="Prévu" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realise" fill={COLORS.realise} name="Réalisé" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section détaillée des heures (si applicable) */}
      {financialData.nbPhases > 0 && (
        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 shadow-xl border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg shadow-lg">
                <IconCalculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg">Détail Main-d'œuvre</span>
                <div className="text-sm font-normal text-gray-600">
                  Répartition par type d'activité
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fabrication */}
              {(financialData.objectifHeuresFab || 0) > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconBuildingFactory className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-800">Fabrication</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prévu:</span>
                      <span className="font-semibold">{formatHours(financialData.objectifHeuresFab)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coût:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(financialData.coutObjectifHeuresFab)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Service */}
              {(financialData.objectifHeuresSer || 0) > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <IconClock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-gray-800">Service</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prévu:</span>
                      <span className="font-semibold">{formatHours(financialData.objectifHeuresSer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coût:</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(financialData.coutObjectifHeuresSer)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pose */}
              {(financialData.objectifHeuresPose || 0) > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <IconShoppingCart className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-semibold text-gray-800">Pose</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prévu:</span>
                      <span className="font-semibold">{formatHours(financialData.objectifHeuresPose)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coût:</span>
                      <span className="font-semibold text-amber-600">{formatCurrency(financialData.coutObjectifHeuresPose)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AffaireFinancialSummary; 