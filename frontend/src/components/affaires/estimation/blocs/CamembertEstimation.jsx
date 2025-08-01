import React, { useState, useEffect } from 'react';
import { IconTrendingUp, IconPigMoney, IconHammer, IconBuilding, IconTarget } from '@tabler/icons-react';

/**
 * Camembert Estimation - Design Apple
 * Affichage élégant de la répartition financière
 */
const CamembertEstimation = ({ estimation = {} }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [viewMode, setViewMode] = useState('cout'); // 'cout' ou 'vente'

  // Calculer le total en premier
  const totalMontant = estimation.montantDevis || 0;
  
  // Calculer les montants selon le mode
  const montantMainOeuvre = viewMode === 'cout' 
    ? (estimation.montantMainOeuvreCout || estimation.montantMainOeuvre || 0)
    : (estimation.montantMainOeuvreVente || estimation.montantMainOeuvre || 0);
    
  const gainMainOeuvre = (estimation.montantMainOeuvreGain || 0);

  // Données pour le camembert selon le mode
  const segments = viewMode === 'cout' ? [
    {
      label: 'Achats',
      value: estimation.montantAchats || 0,
      percentage: totalMontant > 0 ? ((estimation.montantAchats || 0) / totalMontant * 100) : 0,
      color: '#8B9B7A', // Vert olive Apple
      lightColor: '#A8B88F',
      icon: IconPigMoney,
      description: 'Matériaux et fournitures'
    },
    {
      label: 'Coût main d\'œuvre',
      value: estimation.montantMainOeuvreCout || estimation.montantMainOeuvre || 0,
      percentage: totalMontant > 0 ? ((estimation.montantMainOeuvreCout || estimation.montantMainOeuvre || 0) / totalMontant * 100) : 0,
      color: '#A67C52', // Terre douce Apple
      lightColor: '#B8906B',
      icon: IconHammer,
      description: 'Coût interne équipe'
    },
    {
      label: 'Frais généraux',
      value: estimation.montantFraisGeneraux || 0,
      percentage: totalMontant > 0 ? ((estimation.montantFraisGeneraux || 0) / totalMontant * 100) : 0,
      color: '#007AFF', // Bleu Apple
      lightColor: '#339CFF',
      icon: IconBuilding,
      description: 'Charges et administration'
    },
    {
      label: 'Marge',
      value: estimation.montantMarge || 0,
      percentage: totalMontant > 0 ? ((estimation.montantMarge || 0) / totalMontant * 100) : 0,
      color: '#34C759', // Vert Apple
      lightColor: '#5DD777',
      icon: IconTarget,
      description: 'Bénéfice estimé'
    }
  ] : [
    // Vue VENTE
    {
      label: 'Achats',
      value: estimation.montantAchats || 0,
      percentage: totalMontant > 0 ? ((estimation.montantAchats || 0) / totalMontant * 100) : 0,
      color: '#8B9B7A', // Vert olive Apple
      lightColor: '#A8B88F',
      icon: IconPigMoney,
      description: 'Matériaux et fournitures'
    },
    {
      label: 'Vente main d\'œuvre',
      value: estimation.montantMainOeuvreVente || estimation.montantMainOeuvre || 0,
      percentage: totalMontant > 0 ? ((estimation.montantMainOeuvreVente || estimation.montantMainOeuvre || 0) / totalMontant * 100) : 0,
      color: '#FF6B6B', // Rouge doux pour la vente
      lightColor: '#FF8787',
      icon: IconHammer,
      description: 'Vente client main d\'œuvre'
    },
    {
      label: 'Frais généraux',
      value: estimation.montantFraisGeneraux || 0,
      percentage: totalMontant > 0 ? ((estimation.montantFraisGeneraux || 0) / totalMontant * 100) : 0,
      color: '#007AFF', // Bleu Apple
      lightColor: '#339CFF',
      icon: IconBuilding,
      description: 'Charges et administration'
    },
    {
      label: 'Gain MO + Marge',
      value: (estimation.montantMarge || 0) + gainMainOeuvre,
      percentage: totalMontant > 0 ? (((estimation.montantMarge || 0) + gainMainOeuvre) / totalMontant * 100) : 0,
      color: '#34C759', // Vert Apple
      lightColor: '#5DD777',
      icon: IconTarget,
      description: `Gain MO: ${gainMainOeuvre}€ + Marge: ${estimation.montantMarge || 0}€`
    }
  ];
  
  // DEBUG
  console.log('🔍 DEBUG Camembert:', {
    totalMontant,
    segments: segments.map(s => ({ label: s.label, value: s.value, percentage: s.percentage })),
    viewMode
  });

  // Animation au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Calcul des angles pour le SVG
  const calculatePaths = () => {
    let cumulativeAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Filtrer les segments avec une valeur > 0 pour éviter les NaN
    const validSegments = segments.filter(segment => segment.value > 0);
    
    // Si aucun segment valide, retourner un tableau vide
    if (validSegments.length === 0) {
      return [];
    }

    return validSegments.map((segment, index) => {
      const angle = (segment.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;

      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      cumulativeAngle += angle;

      return {
        ...segment,
        pathData,
        startAngle,
        endAngle,
        originalIndex: segments.indexOf(segment), // Ajouter l'index original
        isHovered: hoveredSegment === segments.indexOf(segment)
      };
    });
  };

  const formatEuros = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(montant);
  };

  const formatPercentage = (value) => {
    // Arrondir à 1 décimale
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}%` : `${rounded.toFixed(1)}%`;
  };

  const paths = calculatePaths();

  if (!totalMontant || totalMontant === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-400 mb-4">
          <IconTrendingUp className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-600">Saisissez un montant pour afficher la répartition</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
            <IconTrendingUp className="w-5 h-5 text-white" />
          </div>
          Répartition Financière
        </h3>
        <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text">
          {formatEuros(totalMontant)}
        </p>
        
        {/* Boutons de bascule */}
        {estimation.montantMainOeuvreVente && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setViewMode('cout')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'cout' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              💰 Vue Coûts
            </button>
            <button
              onClick={() => setViewMode('vente')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'vente' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              💸 Vue Vente/Gain
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Camembert SVG */}
        <div className="relative">
          <div className="relative group">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              className="mx-auto drop-shadow-lg"
            >
              {/* Ombre portée */}
              <defs>
                <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2"/>
                </filter>
                
                {/* Gradients pour chaque segment */}
                {paths.map((segment, index) => (
                  <defs key={`gradient-${index}`}>
                    <radialGradient id={`gradient-${index}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={segment.lightColor} />
                      <stop offset="100%" stopColor={segment.color} />
                    </radialGradient>
                  </defs>
                ))}
              </defs>

              {/* Cercle de base */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="rgba(255, 255, 255, 0.1)"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1"
              />

              {/* Segments du camembert */}
              {paths.length > 0 ? (
                paths.map((segment, index) => (
                  <g key={index}>
                    <path
                      d={segment.pathData}
                      fill={`url(#gradient-${index})`}
                      stroke="white"
                      strokeWidth="2"
                      filter="url(#dropshadow)"
                      className={`transition-all duration-300 cursor-pointer ${
                        isAnimated ? 'opacity-100' : 'opacity-0'
                      } ${
                        segment.isHovered ? 'transform scale-105' : ''
                      }`}
                      style={{
                        transformOrigin: '100px 100px',
                        animationDelay: `${index * 150}ms`,
                        animation: isAnimated ? `slideIn 0.8s ease-out forwards` : 'none'
                      }}
                      onMouseEnter={() => setHoveredSegment(segment.originalIndex)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                    
                    {/* Étiquettes de pourcentage */}
                    {segment.percentage > 5 && (
                      <text
                        x={100 + 50 * Math.cos(((segment.startAngle + segment.endAngle) / 2 * Math.PI) / 180)}
                        y={100 + 50 * Math.sin(((segment.startAngle + segment.endAngle) / 2 * Math.PI) / 180)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-sm font-bold fill-white drop-shadow-lg"
                        style={{ fontSize: '12px' }}
                      >
                        {formatPercentage(segment.percentage)}
                      </text>
                    )}
                  </g>
                ))
              ) : (
                // Afficher un cercle gris quand tous les montants sont à 0
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="#E5E7EB"
                  stroke="white"
                  strokeWidth="2"
                  filter="url(#dropshadow)"
                />
              )}

              {/* Centre décoratif */}
              <circle
                cx="100"
                cy="100"
                r="25"
                fill="url(#centerGradient)"
                className="drop-shadow-lg"
              />
              
              <defs>
                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                  <stop offset="100%" stopColor="rgba(200, 200, 200, 0.1)" />
                </radialGradient>
              </defs>
            </svg>

            {/* Indicateur central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <IconTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Légende interactive */}
        <div className="space-y-3">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            const isHovered = hoveredSegment === index;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  isHovered 
                    ? 'bg-white shadow-lg transform scale-105' 
                    : 'bg-gray-50 hover:bg-white'
                }`}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-800">
                        {segment.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {segment.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {formatEuros(segment.value)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPercentage(segment.percentage)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">
              {estimation.totalDemiJournees || 0}
            </div>
            <div className="text-blue-600">Demi-journées</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">
              {estimation.nombrePersonnes || 0}
              {estimation.nombreSousTraitants > 0 && ` + ${estimation.nombreSousTraitants}`}
            </div>
            <div className="text-green-600">
              Personnes{estimation.nombreSousTraitants > 0 && ' (+ sous-trait.)'}
            </div>
          </div>
        </div>
        
        {/* Affichage spécial du gain en mode vente */}
        {viewMode === 'vente' && gainMainOeuvre > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <div className="text-center">
              <div className="text-sm text-emerald-600 mb-1">💰 Gain sur la vente main d'œuvre</div>
              <div className="text-2xl font-bold text-emerald-700">
                + {formatEuros(gainMainOeuvre)}
              </div>
              <div className="text-xs text-emerald-600 mt-2">
                Vente ({formatEuros(estimation.montantMainOeuvreVente || 0)}) - 
                Coût ({formatEuros(estimation.montantMainOeuvreCout || 0)})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.8) rotate(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CamembertEstimation; 