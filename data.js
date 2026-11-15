// 演示数据生成器（原创）——模拟近 90 天经营数据
(function () {
  const DAY = 864e5;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 可复现的伪随机
  let seed = 42;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const CATEGORIES = ["数码", "家居", "服饰", "美妆", "食品"];
  const CAT_COLORS = ["#6366f1", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6"];

  // 生成每日数据：基础销量 * 周期波动 * 随机 + 周末效应
  const daily = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY);
    const dow = date.getDay();
    const weekendBoost = (dow === 0 || dow === 6) ? 1.35 : 1;
    const trend = 1 + (89 - i) * 0.004;              // 缓慢增长趋势
    const promo = (i % 14 === 3) ? 1.6 : 1;          // 周期性促销
    const base = 32000 * weekendBoost * trend * promo;
    const sales = Math.round(base * (0.75 + rand() * 0.5));
    const orders = Math.round(sales / (180 + rand() * 120));
    daily.push({ date, sales, orders });
  }

  // 品类分布（近 30 天）
  const categoryShare = CATEGORIES.map((name, i) => ({
    name,
    value: Math.round(100 * (0.7 + rand())),
    color: CAT_COLORS[i],
  }));

  const TOP_PRODUCTS = [
    { name: "降噪头戴耳机", category: "数码", sales: 1284, revenue: 769116 },
    { name: "机械键盘 87 键", category: "数码", sales: 976, revenue: 321104 },
    { name: "铸铁珐琅锅 24cm", category: "家居", sales: 432, revenue: 198288 },
    { name: "瑜伽垫加厚 8mm", category: "服饰", sales: 1205, revenue: 119295 },
    { name: "冷萃咖啡壶 800ml", category: "家居", sales: 658, revenue: 91462 },
  ];

  const ORDER_STATUS = [
    ["paid", "已支付"], ["shipped", "已发货"], ["pending", "待付款"], ["refund", "退款中"],
  ];
  const NAMES = ["张*明", "李*华", "王*芳", "刘*洋", "陈*静", "杨*帆", "赵*磊", "黄*敏"];
  const RECENT_ORDERS = Array.from({ length: 8 }, (_, i) => {
    const amount = Math.round(50 + rand() * 900);
    const st = ORDER_STATUS[Math.floor(rand() * 3.2)];
    return {
      no: "SP" + (2026110000 + Math.floor(rand() * 89999)),
      buyer: NAMES[Math.floor(rand() * NAMES.length)],
      amount,
      status: st[0],
      statusText: st[1],
      time: new Date(today.getTime() - rand() * DAY).toTimeString().slice(0, 5),
    };
  });

  window.DASH_DATA = { daily, categoryShare, TOP_PRODUCTS, RECENT_ORDERS, CAT_COLORS };
})();
