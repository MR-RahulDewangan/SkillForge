import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getInstitutionOverview,
  getIndustryDemand,
  getStudentGaps,
  getPlacementFunnel
} from '../api/analyticsApi';
import {
  Users,
  Award,
  Briefcase,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { LoadingScreen, EmptyState } from '../components/UIFeedback';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const AnalyticsChartPlaceholder = ({ title, data, type = 'bar', color = 'indigo' }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        {type === 'bar' ? <BarChart3 size={20} className="text-indigo-600" /> : <PieChart size={20} className="text-indigo-600" />}
        {title}
      </h3>
      <div className="space-y-4">
        {data && data.length > 0 ? data.map((item, idx) => {
          const val = item.count || item.avgGap || item.value || 0;
          const maxVal = Math.max(...data.map(i => i.count || i.avgGap || i.value || 0), 1);
          const width = `${(val / maxVal) * 100}%`;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">{item.name || item.stage}</span>
                <span className="text-indigo-600 font-bold">{val}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${color}-500 transition-all duration-500`}
                  style={{ width }}
                />
              </div>
            </div>
          );
        }) : (
          <EmptyState
            title="No Chart Data"
            description="There is no data available for this metric at the moment."
            icon={BarChart3}
          />
        )}
      </div>
    </div>
  );
};

const InstitutionAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [demand, setDemand] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, dem, gap, fun] = await Promise.all([
          getInstitutionOverview(),
          getIndustryDemand(),
          getStudentGaps(),
          getPlacementFunnel()
        ]);
        setOverview(ov.metrics);
        setDemand(dem);
        setGaps(gap);
        setFunnel(fun);
      } catch (err) {
        console.error('Analytics fetch failed', err);
        setError('Failed to load institutional analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingScreen message="Loading institutional analytics..." />;
  if (error) return <EmptyState title="Error" description={error} icon={AlertCircle} />;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition font-medium"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Institutional Analytics</h1>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={overview?.totalStudents || 0} icon={Users} color="bg-blue-500" />
          <StatCard title="Assessed" value={overview?.assessedStudents || 0} icon={TrendingUp} color="bg-indigo-500" />
          <StatCard title="Ready Students" value={overview?.readyCount || 0} icon={Award} color="bg-green-500" />
          <StatCard title="Avg Skill Score" value={`${overview?.avgScore || 0}%`} icon={BarChart3} color="bg-purple-500" />
          <StatCard title="Total Applications" value={overview?.totalApplications || 0} icon={Briefcase} color="bg-amber-500" />
          <StatCard title="Shortlisted" value={overview?.shortlistedCount || 0} icon={CheckCircle} color="bg-cyan-500" />
          <StatCard title="Selected" value={overview?.selectedCount || 0} icon={Award} color="bg-emerald-500" />
          <StatCard title="Companies" value={overview?.companyCount || 0} icon={Users} color="bg-slate-500" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnalyticsChartPlaceholder title="Industry Skill Demand" data={demand} color="indigo" />
          <AnalyticsChartPlaceholder title="Average Student Skill Gaps" data={gaps} color="red" />
          <AnalyticsChartPlaceholder title="Placement Funnel" data={funnel} color="green" />
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-indigo-600" />
              Institutional Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-800 font-medium">
                  Most demanded skill: <span className="font-bold">{demand[0]?.name || 'N/A'}</span>
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-800 font-medium">
                  Critical gap in: <span className="font-bold">{gaps[0]?.name || 'N/A'}</span>
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm text-green-800 font-medium">
                  Placement Readiness: <span className="font-bold">{Math.round((overview?.readyCount / (overview?.totalStudents || 1)) * 100)}%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionAnalytics;
