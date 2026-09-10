import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createDepartment,
  getDepartmentById,
  updateDepartment,
} from "../../services/departmentService";

function DepartmentForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDepartment() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const department = await getDepartmentById(
          token,
          Number(id)
        );

        setName(department.name);
        setDescription(department.description);
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) return;

    setError("");

    try {
      if (isEditMode) {
        await updateDepartment(token, Number(id), {
          name,
          description,
        });
      } else {
        await createDepartment(token, {
          name,
          description,
        });
      }

      navigate("/departments");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to save department.");
      }
    }
  }

  if (loading) {
    return <p>Loading department...</p>;
  }

  return (
    <div>
      <h1>
        {isEditMode
          ? "Edit Department"
          : "Add Department"}
      </h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
            Department Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
          />
        </div>

        <button type="submit">
          {isEditMode ? "Update" : "Create"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/departments")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default DepartmentForm;