import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { apiRequest } from "../../services/api";

type Role = "patient" | "doctor" | "staff";

interface Department {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

function Register() {
  const [role, setRole] = useState<Role>("patient");

  const [departments, setDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    blood_group: "",
    department_id: "",
    specialization: "",
    license_number: "",
    position: "",
  });

  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const data = await apiRequest("/departments");
        setDepartments(data);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    }

    fetchDepartments();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError("");
  }

  function handleRoleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setRole(event.target.value as Role);

    setForm({
      ...form,
      department_id: "",
      specialization: "",
      license_number: "",
      position: "",
    });

    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const baseData = {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      };

      if (role === "patient") {
        await register({
          role: "patient",
          data: {
            ...baseData,
            date_of_birth: form.date_of_birth,
            gender: form.gender,
            address: form.address,
            blood_group: form.blood_group,
          },
        });
      } else if (role === "doctor") {
        await register({
          role: "doctor",
          data: {
            ...baseData,
            department_id: Number(form.department_id),
            specialization: form.specialization,
            license_number: form.license_number,
          },
        });
      } else {
        await register({
          role: "staff",
          data: {
            ...baseData,
            department_id: Number(form.department_id),
            position: form.position,
          },
        });
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="register-page">
      <aside className="register-aside">
        <div className="register-aside-top">
          <div className="register-logo">+</div>

          <div>
            <h1>HMS</h1>
            <span>Hospital Management System</span>
          </div>
        </div>

        <div className="register-aside-content">
          <span className="register-eyebrow">
            {role === "patient"
              ? "PATIENT PORTAL"
              : role === "doctor"
              ? "DOCTOR PORTAL"
              : "STAFF PORTAL"}
          </span>

          <h2>
            Your care,
            <br />
            all in one place.
          </h2>

          <p>
            Create your account to access the Hospital Management System.
          </p>
        </div>

        <div className="register-aside-footer">
          <span>Hospital Management System</span>
          <span>2026</span>
        </div>
      </aside>

      <main className="register-main">
        <div className="register-form-wrapper">
          <div className="register-heading">
            <span className="register-step">ACCOUNT REGISTRATION</span>

            <h2>Create your account</h2>

            <p>Enter your information below to get started.</p>
          </div>

          {success && (
            <div className="register-success">
              <div className="success-icon">✓</div>

              <div>
                <strong>Account created successfully</strong>

                <p>
                  {role === "patient"
                    ? "Taking you to the login page..."
                    : "Your account is pending admin approval."}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="register-error">
              <strong>Registration failed</strong>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <section className="register-form-section">
              <div className="register-section-title">
                <span>01</span>
                <h3>Account details</h3>
              </div>

              <div className="register-fields">
                <div className="auth-field">
                  <label htmlFor="username">Username</label>

                  <input
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="role">Account Type</label>

                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={handleRoleChange}
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="register-form-section">
              <div className="register-section-title">
                <span>02</span>

                <h3>
                  {role === "patient"
                    ? "Personal information"
                    : role === "doctor"
                    ? "Doctor information"
                    : "Staff information"}
                </h3>
              </div>

              <div className="register-fields">
                <div className="auth-field">
                  <label htmlFor="first_name">First Name</label>

                  <input
                    id="first_name"
                    name="first_name"
                    placeholder="First name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="last_name">Last Name</label>

                  <input
                    id="last_name"
                    name="last_name"
                    placeholder="Last name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {role === "patient" && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="date_of_birth">
                        Date of Birth
                      </label>

                      <input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={form.date_of_birth}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="gender">Gender</label>

                      <select
                        id="gender"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="phone">Phone</label>

                      <input
                        id="phone"
                        name="phone"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="blood_group">
                        Blood Group
                      </label>

                      <select
                        id="blood_group"
                        name="blood_group"
                        value={form.blood_group}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="auth-field register-full">
                      <label htmlFor="address">Address</label>

                      <input
                        id="address"
                        name="address"
                        placeholder="Enter your address"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}

                {role === "doctor" && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="phone">Phone</label>

                      <input
                        id="phone"
                        name="phone"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="department_id">
                        Department
                      </label>

                      <select
                        id="department_id"
                        name="department_id"
                        value={form.department_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select department
                        </option>

                        {departments.map((department) => (
                          <option
                            key={department.id}
                            value={department.id}
                          >
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="specialization">
                        Specialization
                      </label>

                      <input
                        id="specialization"
                        name="specialization"
                        placeholder="e.g. Cardiology"
                        value={form.specialization}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="license_number">
                        License Number
                      </label>

                      <input
                        id="license_number"
                        name="license_number"
                        placeholder="Medical license number"
                        value={form.license_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}

                {role === "staff" && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="phone">Phone</label>

                      <input
                        id="phone"
                        name="phone"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="department_id">
                        Department
                      </label>

                      <select
                        id="department_id"
                        name="department_id"
                        value={form.department_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select department
                        </option>

                        {departments.map((department) => (
                          <option
                            key={department.id}
                            value={department.id}
                          >
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="auth-field register-full">
                      <label htmlFor="position">Position</label>

                      <select
                        id="position"
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select position</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Receptionist">
                          Receptionist
                        </option>
                        <option value="Lab Technician">
                          Lab Technician
                        </option>
                        <option value="Pharmacist">
                          Pharmacist
                        </option>
                        <option value="Administrative Staff">
                          Administrative Staff
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </section>

            <div className="register-actions">
              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="auth-link">
                <span>Already have an account?</span>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;
