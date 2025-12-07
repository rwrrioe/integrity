import { useState, useEffect } from 'react';
import { X, Brain, TrendingUp, Download, Play, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api, endpoints } from '../../../services/api';
import { wsService } from '../../../services/socket';

interface AIAnalyticsPanelProps {
  defect: any;
  onClose: () => void;
}

export function AIAnalyticsPanel({ defect, onClose }: AIAnalyticsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [condition, setCondition] = useState<string>('');
  const [assignedTeam, setAssignedTeam] = useState<any>(null);

  // Подписка на WS при открытии
  useEffect(() => {
    if (!defect.id) return;

    const handleUpdate = (data: any) => {
        if (data.prediction !== undefined) {
            setPrediction(data.prediction / 100); // Бэк шлет 0-100, приводим к 0.0-1.0
            setCondition(data.condition);
            setLoading(false);
        }
        if (data.team) {
            setAssignedTeam(data.team);
        }
    };

    // Подписываемся на ID дефекта
    wsService.subscribe(String(defect.id), handleUpdate);

    return () => {
        wsService.unsubscribe(String(defect.id), handleUpdate);
    };
  }, [defect.id]);

  const runModel = async () => {
      setLoading(true);
      try {
          // POST /api/objects/:id вызывает AI
          await api.post(endpoints.callAI(defect.id), {});
          // Ответ придет в WebSocket
      } catch (e) {
          console.error(e);
          setLoading(false);
      }
  };

  // Mock initial data if no real prediction yet
  const aiData = {
    probability: prediction ?? 0.0, // Используем реальное значение
    featureImportance: [
      { name: 'Wall Thickness', value: 0.32 },
      { name: 'Corrosion Rate', value: 0.28 },
      { name: 'Age', value: 0.18 },
    ],
    probabilityHistory: [
      { month: 'Jan', value: 0.45 },
      { month: 'Jun', value: 0.87 },
    ],
  };

  const getSeverityLabel = () => {
    const prob = aiData.probability;
    if (prob >= 0.7) return { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-50' };
    if (prob >= 0.4) return { label: 'Medium Risk', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const severityInfo = getSeverityLabel();

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl z-[1001] overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-white">AI Analytics</h3>
            <p className="text-purple-100">IntegrityOS ML Core</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-purple-500 rounded text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-slate-700 mb-1">Object ID</p>
          <p className="text-slate-900">{defect.id}</p>
        </div>

        {/* Action Button */}
        {!prediction && (
            <button 
                onClick={runModel}
                disabled={loading}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div> : <Play className="w-4 h-4" />}
                {loading ? 'Processing...' : 'Run Analysis'}
            </button>
        )}

        {/* Results */}
        {(prediction !== null) && (
            <div className={`p-4 rounded-lg ${severityInfo.bg} animate-in fade-in zoom-in`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700">Risk Assessment</span>
                <span className={`px-3 py-1 rounded ${severityInfo.color} bg-white font-bold`}>
                {condition || severityInfo.label}
                </span>
            </div>
            <p className="text-slate-600">
                AI Confidence: {(prediction * 100).toFixed(1)}%
            </p>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all duration-1000"
                style={{ width: `${prediction * 100}%` }}
                ></div>
            </div>
            </div>
        )}

        {/* Auto Assigned Team Notification */}
        {assignedTeam && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in slide-in-from-right">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Auto-Assigned Team</span>
                </div>
                <p className="text-blue-800 text-sm">
                    High risk detected. Maintenance team dispatched.
                </p>
                <div className="mt-2 text-sm text-blue-700">
                    <p>Team ID: {assignedTeam.TeamId || 'Alpha'}</p>
                </div>
            </div>
        )}

        {/* Feature Importance (Static for demo unless backend sends it) */}
        <div>
          <h4 className="text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Feature Importance
          </h4>
          <div className="space-y-2">
            {aiData.featureImportance.map((feature, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-700">{feature.name}</span>
                  <span className="text-slate-600">{(feature.value * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all"
                    style={{ width: `${feature.value * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}