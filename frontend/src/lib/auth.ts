export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getRoleHome = (role: string) => {
  switch (role) {
    case "admin": return "/admin/dashboard";
    case "manager": return "/manager/approvals";
    case "employee": return "/employee/submit";
    default: return "/login";
  }
};
