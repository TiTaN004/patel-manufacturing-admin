public function checkSlug()
{
try {
$slug = $_GET['slug'] ?? null;
$exclude_id = $_GET['exclude_id'] ?? null;

if (!$slug) {
http_response_code(400);
echo json_encode(['success' => false, 'message' => "Slug is required"]);
return;
}

$sql = "SELECT COUNT(*) as total FROM products WHERE slug = ?";
$params = [$slug];

if ($exclude_id) {
$sql .= " AND id != ?";
$params[] = $exclude_id;
}

$stmt = $this->db->prepare($sql);
$stmt->execute($params);
$count = (int) $stmt->fetch()['total'];

echo json_encode(['success' => true, 'exists' => $count > 0]);
} catch (\Exception $e) {
http_response_code(500);
echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
}