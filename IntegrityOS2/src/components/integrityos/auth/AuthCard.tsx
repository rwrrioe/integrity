import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white">IO</span>
              </div>
              <span className="text-slate-900">IntegrityOS</span>
            </div>
            <h1 className="text-slate-900 mb-2">{title}</h1>
            {subtitle && <p className="text-slate-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
