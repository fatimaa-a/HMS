import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDepartmentById } from "../../services/departmentService";
import type { Department } from "../../types/department";

function DepartmentDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();

  const [department, setDepartment] =
    useState<Department | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadDepartment() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDepartmentById(
          token,
          Number(id)
        );

        setDepartment(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load department.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDepartment();
  }, [token, id]);

  if (loading) {
    return <p>Loading department...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!department) {
    return <p>Department not found.</p>;
  }

  return (
    <div>
      <h1>{department.name}</h1>

      <p>
        <strong>ID:</strong> {department.id}
      </p>

      <p>
        <strong>Description:</strong>{" "}
        {department.description}
      </p>

      <p>
        <strong>Created:</strong>{" "}
        {department.created_at}
      </p>

      {isAdmin && (
        <Link to={`/departments/${department.id}/edit`}>
          Edit Department
        </Link>
      )}

      <br />

      <Link to="/departments">
        Back to Departments
      </Link>
    </div>
  );
}

export default DepartmentDetails;