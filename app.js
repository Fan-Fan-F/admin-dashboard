// ShopPulse 看板逻辑
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const fmtWan = (n) => n >= 10000 ? (n / 10000).toFixed(2) + " 万" : n.toLocaleString();

  function slice(days) {
    return DASH_DATA.daily.slice(-days);
  }

  function kpis(days) {
    const cur = slice(days);
    const prev = DASH_DATA.daily.slice(-days * 2, -days);
    const sum = (arr, k) => arr.reduce((s, d) => s + d[k], 0);
    const sales = sum(cur, "sales"), orders = sum(cur, "orders");
    const aov = orders ? sales / orders : 0;
    // 转化率模拟：访客 = 订单 * 28~35
    const conversion = orders / (orders * (28 + (days % 5)));

    function delta(curV, prevV) {
      if (!prevV) return null;
      return ((curV - prevV) / prevV * 100);
    }
    return [
      { label: "销售额 (¥)", value: fmtWan(sales), d: delta(sales, sum(prev, "sales")) },
      { label: "订单量", value: orders.toLocaleString(), d: delta(orders, sum(prev, "orders")) },
      { label: "客单价 (¥)", value: aov.toFixed(0), d: delta(aov, sum(prev, "sales") / sum(prev, "orders")) },
      { label: "转化率", value: (conversion * 100).toFixed(2) + "%", d: delta(conversion, conversion * 0.96) },
    ];
  }

  function renderKPIs(days) {
    $("#kpiGrid").innerHTML = kpis(days).map(k => {
      const cls = k.d == null ? "" : k.d >= 0 ? "up" : "down";
      const arrow = k.d == null ? "" : (k.d >= 0 ? "▲ " : "▼ ") + Math.abs(k.d).toFixed(1) + "% vs 上周期";
      return `<div class="kpi">
        <div class="label">${k.label}</div>
        <div class="value">${k.value}</div>
        <div class="delta ${cls}">${arrow}</div>
      </div>`;
    }).join("");
  }

  function renderTrend(days) {
    const data = slice(days);
    const labels = data.map(d => `${d.date.getMonth() + 1}/${d.date.getDate()}`);
    Charts.drawLineChart($("#trendChart"), labels,
      data.map(d => d.sales), data.map(d => d.orders));
  }

  function renderPie() {
    const parts = Charts.drawDonut($("#pieChart"), DASH_DATA.categoryShare);
    $("#pieLegend").innerHTML = parts.map(p =>
      `<span><i class="dot" style="background:${p.color}"></i>${p.name} ${p.pct}%</span>`).join("");
  }

  function renderTop() {
    $("#topProducts").innerHTML =
      `<tr><th></th><th>商品</th><th>品类</th><th>销量</th><th>销售额</th></tr>` +
      DASH_DATA.TOP_PRODUCTS.map((p, i) => `
        <tr>
          <td><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
          <td>${p.name}</td><td>${p.category}</td>
          <td>${p.sales.toLocaleString()}</td>
          <td>¥${p.revenue.toLocaleString()}</td>
        </tr>`).join("");
  }

  function renderOrders() {
    $("#orderCount").textContent = `今日 ${DASH_DATA.RECENT_ORDERS.length} 笔`;
    $("#recentOrders").innerHTML =
      `<tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>时间</th></tr>` +
      DASH_DATA.RECENT_ORDERS.map(o => `
        <tr>
          <td>${o.no}</td><td>${o.buyer}</td>
          <td>¥${o.amount.toLocaleString()}</td>
          <td><span class="status ${o.status}">${o.statusText}</span></td>
          <td>${o.time}</td>
        </tr>`).join("");
  }

  function renderAll() {
    const days = +$("#rangeSelect").value;
    renderKPIs(days);
    renderTrend(days);
  }

  $("#rangeSelect").addEventListener("change", renderAll);
  window.addEventListener("resize", () => { renderTrend(+$("#rangeSelect").value); renderPie(); });

  renderAll();
  renderPie();
  renderTop();
  renderOrders();
})();
