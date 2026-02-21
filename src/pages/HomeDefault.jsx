import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
                                    
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>

      <button style={{ backgroundColor: "blue", color: "white" }} onClick={() => navigate("/admin")}>
        Admin
      </button>

      <br /><br />

      <button style={{ backgroundColor: "blue", color: "white" }} onClick={() => navigate("/faculty")}>
        Faculty
      </button>

      <br /><br />

      <button style={{ backgroundColor: "blue", color: "white" }} onClick={() => navigate("/registrar")}>
        Registrar
      </button>

      <br /><br />

      <button style={{ backgroundColor: "blue", color: "white" }} onClick={() => navigate("/student")}>
        Student
      </button>

      <br /><br />

      {/* <button onClick={() => navigate("/admin/students")}>
        Manage Students
      </button>

      <br /><br />

      <button onClick={() => navigate("/test")}>
        Test Page
      </button> */}
    </div>
  );
}

export default Home;