const CODE_SNIPPETS = [
  `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
}`,
  `async function fetchLeaderboard() {
  const res = await api.get('/leaderboards');
  return res.data.items;
}`,
  `def solve():
    a, b = map(int, input().split())
    print(a + b)`,
  `const graph = new Map();
for (const [u, v] of edges) {
  if (!graph.has(u)) graph.set(u, []);
  graph.get(u).push(v);
}`,
];

function CodePanel({ code, className }: { code: string; className?: string }) {
  return (
    <div
      className={`shrink-0 rounded-lg border border-white/10 bg-zinc-900/80 p-4 font-mono text-[11px] leading-relaxed text-zinc-300 shadow-xl backdrop-blur-sm ${className ?? ''}`}
    >
      <pre className="whitespace-pre">{code}</pre>
    </div>
  );
}

export function HeroCodeBackground() {
  const track = [...CODE_SNIPPETS, ...CODE_SNIPPETS];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background" />
      <div className="absolute inset-x-0 top-1/3 h-1/3 bg-gradient-to-b from-background/90 via-background/80 to-background/90" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent" />

      <div className="absolute left-0 top-1/4 flex animate-marquee-left gap-6 opacity-40">
        {track.map((code, i) => (
          <CodePanel key={`l-${i}`} code={code} />
        ))}
      </div>

      <div className="absolute right-0 top-1/2 flex animate-marquee-right gap-6 opacity-35">
        {track.map((code, i) => (
          <CodePanel key={`r-${i}`} code={code} />
        ))}
      </div>
    </div>
  );
}
