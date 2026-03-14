export default function DiscussionSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
          {/* Author row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-slate-200 rounded-full w-32" />
              <div className="h-3 bg-slate-100 rounded-full w-20" />
            </div>
            <div className="h-6 bg-slate-100 rounded-full w-24" />
          </div>
          {/* Title */}
          <div className="h-5 bg-slate-200 rounded-full w-3/4 mb-3" />
          {/* Content lines */}
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-slate-100 rounded-full w-full" />
            <div className="h-3 bg-slate-100 rounded-full w-5/6" />
          </div>
          {/* Tags */}
          <div className="flex gap-2 mb-4">
            {[60, 80, 50].map(w => (
              <div key={w} className="h-6 bg-slate-100 rounded-full" style={{ width: w }} />
            ))}
          </div>
          {/* Stats row */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
            {[50, 60, 55].map((w, j) => (
              <div key={j} className="h-7 bg-slate-100 rounded-lg" style={{ width: w }} />
            ))}
            <div className="h-7 bg-blue-50 rounded-lg w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}