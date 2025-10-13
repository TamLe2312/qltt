function buildTree(categories) {
  const map = {};
  const roots = [];

  // tạo map id -> category
  categories.forEach((cat) => {
    map[cat.category_id] = { ...cat, subcategories: [] };
  });

  // gắn vào cha nếu có, nếu không thì là root
  categories.forEach((cat) => {
    if (cat.parent_id) {
      map[cat.parent_id].subcategories.push(map[cat.category_id]);
    } else {
      roots.push(map[cat.category_id]);
    }
  });

  return roots;
}

module.exports = buildTree;
