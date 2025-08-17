import React from "react";
import { Card, CardContent } from "../ui/card";

const colorVariants = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-500",
    text: "text-blue-600",
    trend: "text-blue-600"
  },
  green: {
    bg: "bg-green-50", 
    icon: "bg-green-500",
    text: "text-green-600",
    trend: "text-green-600"
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-500", 
    text: "text-purple-600",
    trend: "text-purple-600"
  },
  orange: {
    bg: "bg-orange-50",
    icon: "bg-orange-500",
    text: "text-orange-600", 
    trend: "text-orange-600"
  }
};

export default function KPICard({ title, value, change, trend, icon: Icon, color = "blue" }) {
  const colors = colorVariants[color];
  
  return (
    <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {change}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <div className={`p-2 rounded-lg ${colors.icon}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}