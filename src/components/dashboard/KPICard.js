import React from 'react';
import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, Minus, Loader2, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  color = 'blue',
  loading = false,
  status = 'success', // 'success', 'warning', 'error', 'info'
  onClick
}) => {
  // Configurações de cores baseadas na prop color
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-900',
      trendPositive: 'text-blue-600',
      trendNegative: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100', 
      iconColor: 'text-green-600',
      valueColor: 'text-green-900',
      trendPositive: 'text-green-600',
      trendNegative: 'text-green-500'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600', 
      valueColor: 'text-purple-900',
      trendPositive: 'text-purple-600',
      trendNegative: 'text-purple-500'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-900', 
      trendPositive: 'text-orange-600',
      trendNegative: 'text-orange-500'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-900',
      trendPositive: 'text-red-600', 
      trendNegative: 'text-red-500'
    }
  };

  // Configurações de status
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-100'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100'
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-100'
    },
    info: {
      icon: Info,
      color: 'text-blue-500',
      bg: 'bg-blue-100'
    }
  };

  const colors = colorConfig[color] || colorConfig.blue;
  const statusInfo = statusConfig[status] || statusConfig.success;
  const StatusIcon = statusInfo.icon;

  // Determinar ícone e cor da tendência
  const getTrendIcon = () => {
    if (!trend) return Minus;
    
    const trendValue = parseFloat(trend.replace(/[+\-%]/g, ''));
    if (trendValue > 0) return TrendingUp;
    if (trendValue < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    
    const trendValue = parseFloat(trend.replace(/[+\-%]/g, ''));
    if (trendValue > 0) return colors.trendPositive;
    if (trendValue < 0) return colors.trendNegative;
    return 'text-gray-400';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card 
      className={`relative p-6 ${colors.bg} border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header com ícone e status */}
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 ${colors.iconBg} rounded-lg`}>
              {loading ? (
                <Loader2 className={`h-6 w-6 ${colors.iconColor} animate-spin`} />
              ) : (
                <Icon className={`h-6 w-6 ${colors.iconColor}`} />
              )}
            </div>
            
            {/* Status indicator */}
            <div className={`p-1 ${statusInfo.bg} rounded-full`}>
              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
            </div>
          </div>

          {/* Título */}
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </h3>

          {/* Valor principal */}
          <div className="flex items-baseline space-x-2 mb-2">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${colors.valueColor}`}>
                  {value}
                </div>
                {trend && (
                  <div className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
                    <TrendIcon className="h-4 w-4 mr-1" />
                    {trend}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Descrição */}
          <p className="text-xs text-gray-500 leading-tight">
            {loading ? (
              <div className="flex space-x-1">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              description
            )}
          </p>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      )}
    </Card>
  );
};

export default KPICard;