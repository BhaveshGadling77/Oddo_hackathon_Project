import { useState, useEffect, useCallback } from "react";
import { approvalAPI } from "../services/api";

export function useApprovals() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await approvalAPI.getPendingApprovals();
      setItems(data.expenses || data.pending || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = useCallback(async (id, comment = "Approved via portal") => {
    await approvalAPI.approve(id, comment);
    setItems((prev) => prev.filter((e) => (e._id || e.id) !== id));
  }, []);

  const reject = useCallback(async (id, comment) => {
    await approvalAPI.reject(id, comment);
    setItems((prev) => prev.filter((e) => (e._id || e.id) !== id));
  }, []);

  return { items, loading, error, reload: load, approve, reject };
}
