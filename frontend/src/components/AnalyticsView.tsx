import { Note, Category } from '../App';
import { Card } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, FileText, FolderOpen, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  notes: Note[];
  categories: Category[];
}

export function AnalyticsView({ notes, categories }: AnalyticsViewProps) {
  // Calculate notes by category
  const categoryData = categories.map(category => {
    const count = notes.filter(note => note.categoryId === category.id).length;
    return {
      name: category.name,
      value: count,
      color: category.color.replace('bg-', ''),
    };
  }).filter(item => item.value > 0);

  // Calculate notes by day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const activityData = last7Days.map(date => {
    const count = notes.filter(note => {
      const noteDate = new Date(note.timestamp);
      return noteDate.toDateString() === date.toDateString();
    }).length;
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      notes: count,
    };
  });

  // Stats
  const totalNotes = notes.length;
  const totalCategories = categories.length;
  const notesToday = notes.filter(note => {
    const today = new Date();
    const noteDate = new Date(note.timestamp);
    return noteDate.toDateString() === today.toDateString();
  }).length;

  const colorMap: Record<string, string> = {
    'orange-500': '#f97316',
    'teal-500': '#14b8a6',
    'purple-500': '#a855f7',
    'rose-500': '#f43f5e',
    'amber-500': '#f59e0b',
    'coral-500': '#ff7f50',
    'emerald-500': '#10b981',
    'blue-500': '#3b82f6',
    'pink-500': '#ec4899',
    'lime-500': '#84cc16',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-coral-50 to-amber-50 border-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-12 bg-gradient-to-br from-coral-500 to-amber-500 rounded-xl flex items-center justify-center text-white">
              <FileText className="size-5 sm:size-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600">Total Notes</p>
              <p className="text-slate-900">{totalNotes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-blue-50 border-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
              <FolderOpen className="size-5 sm:size-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600">Categories</p>
              <p className="text-slate-900">{totalCategories}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-md sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
              <Calendar className="size-5 sm:size-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600">Notes Today</p>
              <p className="text-slate-900">{notesToday}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-white shadow-md border-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <TrendingUp className="size-4 sm:size-5 text-coral-500" />
            <h3 className="text-slate-800">Notes by Category</h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorMap[entry.color] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-slate-500 text-sm">
              No data available
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6 bg-white shadow-md border-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <TrendingUp className="size-4 sm:size-5 text-coral-500" />
            <h3 className="text-slate-800">Activity (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '14px'
                }}
              />
              <Bar dataKey="notes" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7f50" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}