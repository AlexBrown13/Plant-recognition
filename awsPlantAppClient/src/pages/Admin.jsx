import { useEffect, useState } from "react";
import { getAllUsers } from "../utils/api";
import "./Admin.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllUsers();
      const list = Array.isArray(data?.users) ? data.users : [];
      setUsers(list);
    } catch (e) {
      setError(e?.message || "failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="users-container">
        <div className="loading">loading…</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-content">
        <h1 className="users-title">Admin - All Users</h1>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={load} className="btn-retry">
              retry
            </button>
          </div>
        )}

        {!error && users.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h2>no users found</h2>
          </div>
        )}

        {!error && users.length > 0 && (
          <div className="users-list">
            {users.map((user) => (
              <div key={user.userId} className="user-card">
                <div className="user-card-header">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || user.email}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar placeholder">
                      {user.name?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        "?"}
                    </div>
                  )}
                  <div className="user-info">
                    <h3 className="user-name">{user.name || "No Name"}</h3>
                    <p className="user-email">{user.email || "No Email"}</p>
                  </div>
                  {user.isAdmin && <span className="admin-badge">Admin</span>}
                </div>
                <div className="user-card-details">
                  <div className="user-detail">
                    <strong>User ID:</strong>
                    <span>{user.userId}</span>
                  </div>
                  {user.createdAt && (
                    <div className="user-detail">
                      <strong>Joined:</strong>
                      <span>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {user.lastLogin && (
                    <div className="user-detail">
                      <strong>Last Login:</strong>
                      <span>
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
