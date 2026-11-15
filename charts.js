// 零依赖 Canvas 图表工具
(function () {
  "use strict";

  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = (canvas.getAttribute("height") | 0) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx, W: rect.width, H: canvas.getAttribute("height") | 0 };
  }

  /** 折线图（两条序列，左轴金额/右轴数量） */
  function drawLineChart(canvas, labels, seriesA, seriesB) {
    const { ctx, W, H } = setupCanvas(canvas);
    const pad = { l: 54, r: 44, t: 14, b: 28 };
    const w = W - pad.l - pad.r, h = H - pad.t - pad.b;
    const n = labels.length;

    const maxA = Math.max(...seriesA) * 1.1;
    const maxB = Math.max(...seriesB) * 1.1;
    const x = i => pad.l + (i / (n - 1)) * w;
    const yA = v => pad.t + h - (v / maxA) * h;
    const yB = v => pad.t + h - (v / maxB) * h;

    // 网格 + 左轴
    ctx.font = "11px sans-serif";
    ctx.strokeStyle = "#eef0f5";
    ctx.fillStyle = "#9aa1b5";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const v = maxA * i / 4;
      const y = yA(v);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillText(v >= 10000 ? (v / 10000).toFixed(1) + "w" : Math.round(v), pad.l - 8, y + 4);
    }
    // 右轴（订单量）
    ctx.textAlign = "left";
    for (let i = 0; i <= 4; i++) {
      const v = maxB * i / 4;
      ctx.fillText(Math.round(v), W - pad.r + 8, yB(v) + 4);
    }
    // x 轴标签（抽样）
    ctx.textAlign = "center";
    const step = Math.ceil(n / 6);
    labels.forEach((lb, i) => {
      if (i % step === 0) ctx.fillText(lb, x(i), H - 8);
    });

    // 面积填充 + 折线 A
    ctx.beginPath();
    seriesA.forEach((v, i) => i ? ctx.lineTo(x(i), yA(v)) : ctx.moveTo(x(i), yA(v)));
    const lastX = x(n - 1), firstX = x(0), baseY = pad.t + h;
    ctx.save();
    ctx.lineTo(lastX, baseY); ctx.lineTo(firstX, baseY); ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.t, 0, baseY);
    grad.addColorStop(0, "rgba(99,102,241,.25)");
    grad.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = grad; ctx.fill();
    ctx.restore();

    ctx.beginPath();
    seriesA.forEach((v, i) => i ? ctx.lineTo(x(i), yA(v)) : ctx.moveTo(x(i), yA(v)));
    ctx.strokeStyle = "#6366f1"; ctx.lineWidth = 2; ctx.stroke();

    // 折线 B
    ctx.beginPath();
    seriesB.forEach((v, i) => i ? ctx.lineTo(x(i), yB(v)) : ctx.moveTo(x(i), yB(v)));
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke();
    ctx.setLineDash([]);
  }

  /** 环形占比图 */
  function drawDonut(canvas, parts) {
    const { ctx, W, H } = setupCanvas(canvas);
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 12, r = R * 0.62;
    const total = parts.reduce((s, p) => s + p.value, 0);
    let angle = -Math.PI / 2;
    parts.forEach(p => {
      const sweep = (p.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, angle, angle + sweep);
      ctx.arc(cx, cy, r, angle + sweep, angle, true);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
      angle += sweep;
    });
    ctx.fillStyle = "#1a1d26";
    ctx.font = "700 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(parts.length + " 品类", cx, cy + 7);
    return parts.map(p => ({ ...p, pct: (p.value / total * 100).toFixed(1) }));
  }

  window.Charts = { drawLineChart, drawDonut };
})();
