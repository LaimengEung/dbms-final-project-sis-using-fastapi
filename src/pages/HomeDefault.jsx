import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
                                    
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Admin Menu</h1>

      <button onClick={() => navigate("/admin")}>
        Dashboard
      </button>

      <br /><br />

      <button onClick={() => navigate("/admin/users")}>
        Manage Users
      </button>

      <br /><br />

      <button onClick={() => navigate("/admin/students")}>
        Manage Students
      </button>

      <br /><br />

      <button onClick={() => navigate("/test")}>
        Test Page
      </button>
    </div>
  );
}

export default Home;