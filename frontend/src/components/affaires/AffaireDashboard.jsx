/**
 * AffaireDashboard - Tableau de bord des affaires - Style épuré sans bordures
 * 
 * Design principles :
 * - Fond blanc pur, pas de bordures
 * - Ombres légères pour délimiter les zones  
 * - Palette de couleurs sobre :
 *   ✅ Vert : excellent/positif (green-600)
 *   🔵 Bleu : bon/neutre (blue-600)  
 *   🟠 Orange : attention/coefficient (orange-600)
 *   🔴 Rouge : alerte critique uniquement (red-600)
 */

import React from 'react';
import {
  IconCurrencyEuro,
  IconShoppingCart,
  IconClock,
  IconTrendingUp,
  IconAlertTriangle,
  IconArrowUp,
  IconArrowDown,
  IconTarget,
  IconChartBar
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const StatCard = ({ title, value, target, percentage, status, icon: Icon, suffix = '', rightValue }) => {
    // Style épuré sans bordures
    const statusStyles = {
        excellent: { lightBg: 'bg-white', textColor: 'text-green-700', progressBar: 'bg-green-600', borderColor: '' },
        good: { lightBg: 'bg-white', textColor: 'text-blue-700', progressBar: 'bg-blue-600', borderColor: '' },
        warning: { lightBg: 'bg-white', textColor: 'text-orange-700', progressBar: 'bg-orange-500', borderColor: '' },
        danger: { lightBg: 'bg-white', textColor: 'text-red-700', progressBar: 'bg-red-600', borderColor: '' },
        default: { lightBg: 'bg-white', textColor: 'text-gray-700', progressBar: 'bg-gray-500', borderColor: '' },
    };
    const styles = statusStyles[status] || statusStyles.default;

    return (
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
                <div className="p-2 rounded-lg bg-gray-50">
                    <Icon className={`w-5 h-5 ${styles.textColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-800">{value}<span className="text-2xl text-gray-500">{suffix}</span></div>
                    {rightValue && (
                        <div className="text-lg font-semibold text-gray-600">{rightValue}</div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Objectif: {target}{suffix}
                </p>
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-600">Progression</span>
                        <span className={`font-semibold ${styles.textColor}`}>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${styles.progressBar}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const AffaireDashboard = ({ affaire, financialData, marginAlerts }) => {
    const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
    const formatPercentage = (value) => `${(value || 0).toFixed(1)}%`;
    const formatHours = (hours) => `${(hours || 0).toFixed(1)}h`;
    
    const caPercentage = financialData.objectifCA > 0 ? (financialData.caReel / financialData.objectifCA) * 100 : 0;
    const achatsPercentage = financialData.objectifAchats > 0 ? (financialData.achatReel / financialData.objectifAchats) * 100 : 0;
    const heuresPercentage = financialData.objectifHeures > 0 ? (financialData.heuresReelles / financialData.objectifHeures) * 100 : 0;
    
    const getStatus = (percentage, isReverse = false) => {
        if (isReverse) {
            if (percentage <= 80) return 'excellent';
            if (percentage <= 90) return 'good';
            if (percentage <= 105) return 'warning';
            return 'danger';
        } else {
            if (percentage >= 110) return 'excellent';
            if (percentage >= 95) return 'good';
            if (percentage >= 75) return 'warning';
            return 'danger';
        }
    };
    
    const ecartMarge = (financialData.margeReelle || 0) - (financialData.margeObjectif || 0);
    const ecartMargeStatus = ecartMarge >= 0 ? 'good' : 'danger';
    const EcartIcon = ecartMarge >= 0 ? IconArrowUp : IconArrowDown;
    // Couleurs sobres pour écarts
    const ecartMargeStyles = {
        good: 'text-green-600',    // Vert sobre pour positif
        danger: 'text-orange-600', // Orange pour négatif (pas rouge = alerte)
    };

    const margeProgressionPercentage = financialData.margeObjectif > 0 ? (financialData.margeReelle / financialData.margeObjectif) * 100 : 0;
    
    // Statut de marge sobre et professionnel
    let margeStatus = 'danger';
    let margeColor = 'text-orange-600';      // Orange pour attention
    let margeBackground = 'bg-orange-500';
    
    if (margeProgressionPercentage >= 150) {
        margeStatus = 'excellent';
        margeColor = 'text-green-600';       // Vert sobre pour excellent
        margeBackground = 'bg-green-500';
    } else if (margeProgressionPercentage >= 100) {
        margeStatus = 'good';
        margeColor = 'text-blue-600';        // Bleu sobre pour bon
        margeBackground = 'bg-blue-500';
    } else if (margeProgressionPercentage >= 80) {
        margeStatus = 'warning';
        margeColor = 'text-orange-600';      // Orange pour attention
        margeBackground = 'bg-orange-500';
    }

    return (
        <div className="space-y-6">
            {marginAlerts.alerteMargeReelle && (
                <Card className="bg-red-50 border-l-4 border-red-500 shadow-md">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <IconAlertTriangle className="w-6 h-6 text-red-600" />
                        <CardTitle className="text-red-800">Alerte Marge Critique</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-700">
                            Le coefficient de marge est inférieur au seuil critique de 1.6. 
                            <span className="font-bold ml-1">Coefficient actuel : {marginAlerts.coefficientMargeReel.toFixed(2)}</span>
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Hero Card - Marge Réalisée - Style épuré */}
            <Card className="bg-white shadow-lg rounded-lg">
                <CardContent className="p-8">
                    {/* En-tête Hero - Style sobre */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <IconTrendingUp className="w-8 h-8 text-gray-700" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Marge Réalisée</h2>
                                <p className="text-gray-600 text-sm">Indicateur de performance</p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${margeColor} bg-gray-100`}>
                            {margeStatus === 'excellent' ? 'Excellent' : 
                             margeStatus === 'good' ? 'Bon' : 
                             margeStatus === 'warning' ? 'Attention' : 
                             'Critique'}
                        </div>
                    </div>

                    {/* Métrique principale HERO */}
                    <div className="text-center mb-8 p-6 bg-gray-50 rounded-lg">
                        <div className={`text-5xl font-bold mb-2 ${margeColor}`}>
                            {formatCurrency(financialData.margeReelle)}
                        </div>
                        <div className="text-lg text-gray-600 mb-4">Bénéfice réalisé</div>
                        
                        {/* Barre de progression intégrée */}
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div 
                                className={`h-4 rounded-full transition-all duration-1000 ${margeBackground}`}
                                style={{ width: `${Math.min(margeProgressionPercentage, 100)}%` }}
                            />
                        </div>
                        <div className={`text-lg font-semibold ${margeColor} flex items-center justify-center gap-2`}>
                            🎯 {ecartMarge >= 0 ? 
                                `Objectif dépassé de ${formatCurrency(ecartMarge)}` : 
                                `Objectif manqué de ${formatCurrency(Math.abs(ecartMarge))}`
                            }
                        </div>
                    </div>

                    {/* Métriques secondaires - Style épuré */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <IconChartBar className="w-4 h-4 text-green-600" />
                                <span className="text-gray-800 text-sm font-medium">Taux de Marge</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-1">
                                {formatPercentage(financialData.pourcentageMargeReelle)}
                            </div>
                            <div className="text-xs text-gray-600">
                                Objectif: {formatPercentage(financialData.pourcentageMargeObjectif)}
                            </div>
                        </div>
                        
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <IconTarget className="w-4 h-4 text-orange-600" />
                                <span className="text-gray-800 text-sm font-medium">Coefficient</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                                {marginAlerts?.coefficientMargeReel?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-600">
                                Seuil critique: 1.60
                            </div>
                        </div>
                        
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <EcartIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-800 text-sm font-medium">Écart Objectif</span>
                            </div>
                            <div className={`text-2xl font-bold mb-1 flex items-center justify-center gap-1 ${ecartMargeStyles[ecartMargeStatus]}`}>
                                <EcartIcon className="w-5 h-5" />
                                {formatCurrency(Math.abs(ecartMarge))}
                            </div>
                            <div className="text-xs text-gray-600">
                                Prévu: {formatCurrency(financialData.margeObjectif)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cartes indicateurs détaillés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="💼 Chiffre d'Affaires"
                    icon={IconCurrencyEuro}
                    value={formatCurrency(financialData.caReel)}
                    target={formatCurrency(financialData.objectifCA)}
                    percentage={caPercentage}
                    status={getStatus(caPercentage)}
                />
                <StatCard 
                    title="🛒 Achats"
                    icon={IconShoppingCart}
                    value={formatCurrency(financialData.achatReel)}
                    target={formatCurrency(financialData.objectifAchats)}
                    percentage={achatsPercentage}
                    status={getStatus(achatsPercentage, true)}
                />
                <StatCard 
                    title="⏰ Heures Travaillées"
                    icon={IconClock}
                    value={formatCurrency(financialData.totalMainOeuvreReelle)}
                    target={formatCurrency(financialData.heuresReelles > 0 ? (financialData.totalMainOeuvreReelle * financialData.objectifHeures / financialData.heuresReelles) : (financialData.objectifHeures * 50))}
                    percentage={heuresPercentage}
                    status={getStatus(heuresPercentage, true)}
                    rightValue={formatHours(financialData.heuresReelles)}
                />
            </div>
        </div>
    );
};

export default AffaireDashboard; 