import React from 'react';
import { DeepDiveAnalysis, AppIdea } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, ShieldAlert, Zap, Search, ArrowRight } from 'lucide-react';

interface AnalysisViewProps {
  idea: AppIdea;
  analysis: DeepDiveAnalysis | null;
  loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-lg shadow-xl">
        <p className="text-white font-bold uppercase text-xs mb-2 tracking-wide">{label}</p>
        <p className="text-yellow-500 text-sm font-mono">
          Users: {(payload[0].value / 1000).toFixed(1)}k
        </p>
        <p className="text-red-500 text-sm font-mono">
          Rev: ${payload[1].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ idea, analysis, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Initializing Diagnostics...</h3>
        <p className="text-neutral-500 max-w-md font-mono text-xs">
          Calculating growth trajectories and market vectors for <span className="text-red-500">{idea.title}</span>.
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Verdict Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-red-600"></div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 uppercase tracking-wider">
          <Search className="text-red-500" size={18} />
          Market Verdict
        </h3>
        <p className="text-neutral-300 leading-relaxed text-sm font-light">
          {analysis.marketVerdict}
        </p>
      </div>

      {/* Charts Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-widest">12-Month Projection</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analysis.growthProjection}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} fontWeight={600} />
              <YAxis yAxisId="left" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} fontWeight={600} />
              <YAxis yAxisId="right" orientation="right" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} fontWeight={600} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#525252', strokeWidth: 1 }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}/>
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="users" 
                name="Active Users"
                stroke="#eab308" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorUsers)" 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                name="Ad Revenue ($)"
                stroke="#dc2626" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h4 className="flex items-center gap-2 text-white font-bold mb-4 uppercase tracking-wider text-xs">
            <Zap size={16} className="text-yellow-500" /> Strengths
          </h4>
          <ul className="space-y-3">
            {analysis.swot.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-neutral-300 text-xs">
                <span className="mt-1 w-1 h-1 rounded-full bg-yellow-500 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h4 className="flex items-center gap-2 text-white font-bold mb-4 uppercase tracking-wider text-xs">
            <Target size={16} className="text-blue-500" /> Opportunities
          </h4>
          <ul className="space-y-3">
            {analysis.swot.opportunities.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-neutral-300 text-xs">
                <span className="mt-1 w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h4 className="flex items-center gap-2 text-white font-bold mb-4 uppercase tracking-wider text-xs">
            <ShieldAlert size={16} className="text-red-600" /> Weaknesses & Threats
          </h4>
          <ul className="space-y-3">
            {[...analysis.swot.weaknesses, ...analysis.swot.threats].map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-neutral-300 text-xs">
                <span className="mt-1 w-1 h-1 rounded-full bg-red-600 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

         <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3">Optimization Strategy</h4>
            <p className="text-neutral-400 text-xs mb-6 font-light">
               Leverage the <span className="text-white font-bold">"{idea.viralMechanic}"</span> mechanic to lower CPI (Cost Per Install).
            </p>
            <button className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20 border-2 border-neutral-400/60">
              Initiate Build <ArrowRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};