import Header from "../components/Header";
import AdminUserFrom from "../components/admin/AdminUserForm";

const AdminUserFormPage = () => {
  return (
    <div className="register-page">
      <Header />
      <div className="register-layout">
        <div className="register-content">
          <AdminUserFrom />
        </div>
      </div>
    </div>
  );
};

export default AdminUserFormPage;
