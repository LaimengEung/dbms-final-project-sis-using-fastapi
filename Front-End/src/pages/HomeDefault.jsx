import { useNavigate } from 'react-router-dom';
import { ShieldCheck, GraduationCap, BookOpenCheck, ClipboardList, ArrowRight } from 'lucide-react';

const roleCards = [
  {
    key: 'admin',
    title: 'Administrator',
    subtitle: 'Manage users, semesters, security, and school setup',
    path: '/login/admin',
    icon: ShieldCheck,
    tone: 'from-slate-900 to-slate-700',
  },
  {
    key: 'faculty',
    title: 'Faculty',
    subtitle: 'Handle classes, grading workflow, and academic progress',
    path: '/login/faculty',
    icon: BookOpenCheck,
    tone: 'from-blue-900 to-blue-700',
  },
  {
    key: 'registrar',
    title: 'Registrar',
    subtitle: 'Process enrollment, records, and semester operations',
    path: '/login/registrar',
    icon: ClipboardList,
    tone: 'from-emerald-900 to-emerald-700',
  },
  {
    key: 'student',
    title: 'Student',
    subtitle: 'Access your dashboard, enrollment, grades, and profile',
    path: '/login/student',
    icon: GraduationCap,
    tone: 'from-violet-900 to-violet-700',
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-10 flex items-center justify-center">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {roleCards.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => navigate(role.path)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${role.tone}`} />
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <role.icon size={20} />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{role.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{role.subtitle}</p>
                </div>
                <ArrowRight className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-600" size={18} />
              </div>
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Open Portal</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
