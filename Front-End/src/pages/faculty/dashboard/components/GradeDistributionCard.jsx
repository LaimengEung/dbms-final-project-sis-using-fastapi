const GRADE_LETTERS = ["A", "B", "C", "D", "F"];

const GradeDistributionCard = ({ distribution = { A: 3, B: 3, C: 1, D: 0, F: 0 } }) => {
  const maxVal = Math.max(...Object.values(distribution), 1);
  // Y-axis ticks
  const ticks = [];
  for (let i = 0; i <= maxVal; i += Math.ceil(maxVal / 4) || 1) ticks.push(i);
  if (!ticks.includes(maxVal)) ticks.push(maxVal);
  const uniqueTicks = [...new Set(ticks)].sort((a, b) => b - a);

  const chartH = 160;
  const barW = 36;
  const gap = 28;
  const leftPad = 32;
//   const totalW = leftPad + GRADE_LETTERS.length * (barW + gap) + gap;

  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px 24px",
          fontFamily: "'DM Sans', sans-serif",
          flex: 1,
          height: "100%",
          boxSizing: "border-box"
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "20px" }}>
          Grade Distribution
        </div>

        <div style={{ display: "flex", gap: "0", alignItems: "flex-end" }}>
          {/* Y-axis labels */}
          <div
            style={{
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              height: `${chartH}px`, paddingBottom: "0", marginRight: "8px",
              alignItems: "flex-end",
            }}
          >
            {uniqueTicks.map((t) => (
              <span key={t} style={{ fontSize: "11px", color: "#9ca3af", lineHeight: 1 }}>{t}</span>
            ))}
          </div>

          {/* Chart area */}
          <div style={{ flex: 1 }}>
            {/* Bars */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: `${chartH}px`,
                gap: `${gap}px`,
                paddingLeft: `${gap / 2}px`,
                borderLeft: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
                position: "relative",
              }}
            >
              {/* Horizontal grid lines */}
              {uniqueTicks.map((t) => (
                <div
                  key={t}
                  style={{
                    position: "absolute",
                    left: 0, right: 0,
                    bottom: `${(t / maxVal) * chartH}px`,
                    borderTop: t === 0 ? "none" : "1px dashed #f0f2f5",
                    pointerEvents: "none",
                  }}
                />
              ))}

              {GRADE_LETTERS.map((letter) => {
                const val = distribution[letter] ?? 0;
                const heightPct = maxVal > 0 ? (val / maxVal) * chartH : 0;
                return (
                  <div
                    key={letter}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                      position: "relative", zIndex: 1,
                    }}
                  >
                    {val > 0 && (
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600 }}>{val}</span>
                    )}
                    <div
                      style={{
                        width: `${barW}px`,
                        height: `${heightPct}px`,
                        backgroundColor: val > 0 ? "#3b5bff" : "#f3f4f6",
                        borderRadius: "5px 5px 0 0",
                        transition: "height 0.3s ease",
                        minHeight: val > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div
              style={{
                display: "flex",
                gap: `${gap}px`,
                paddingLeft: `${gap / 2}px`,
                marginTop: "6px",
              }}
            >
              {GRADE_LETTERS.map((letter) => (
                <div
                  key={letter}
                  style={{
                    width: `${barW}px`,
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeDistributionCard;
