import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ORBITA ErrorBoundary captured an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      // Clear all myschool keys that could contain corrupted data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('myschool_') || key.startsWith('myacademy_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      window.location.href = '/';
    } catch (e) {
      console.error('Failed to clear cache:', e);
      window.location.reload();
    }
  };

  private handleGoLogin = () => {
    try {
      localStorage.setItem('myschool_page_view', 'login');
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'Terjadi kesalahan sistem yang tidak terduga.';

      return (
        <div className="min-h-screen w-full bg-[#0B1528] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[#0F1E3A]/95 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md">
            {/* Ambient Corner Accent */}
            <div className="absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
            <div className="absolute -top-1 -right-1 h-6 w-6 border-t-2 border-r-2 border-amber-400 rounded-tr-md" />
            <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-2 border-l-2 border-amber-400 rounded-bl-md" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-amber-400 rounded-br-md" />

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/10 shadow-inner">
                <AlertTriangle className="h-8 w-8 text-amber-400 animate-pulse" />
              </div>

              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-300 uppercase">
                Pemulihan Sistem ORBITA
              </span>

              <h1 className="mt-3 text-xl sm:text-2xl font-black text-white tracking-wide">
                Tampilan Mengalami Kendala
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                Aplikasi mendeteksi kendala pada cache peramban atau konfigurasi data. Anda dapat memuat ulang atau mereset cache lokal untuk memulihkan sistem secara instan.
              </p>

              {/* Error Details Accordion */}
              <div className="mt-4 w-full rounded-xl border border-slate-700/60 bg-slate-900/80 p-3 text-left">
                <p className="text-[11px] font-mono font-semibold text-rose-400 break-words line-clamp-3">
                  {errorMessage}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row w-full items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="flex-1 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Muat Ulang Halaman</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleResetCache}
                  className="flex-1 w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-[#0B1528] px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-500/10 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Bersihkan Cache Lokal</span>
                </button>
              </div>

              <button
                type="button"
                onClick={this.handleGoLogin}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Kembali ke Gerbang Masuk (Login)</span>
              </button>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-800 pt-4 text-[11px] text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>SMK Mardi Yuana Cikembar &bull; ORBITA v3.5</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
