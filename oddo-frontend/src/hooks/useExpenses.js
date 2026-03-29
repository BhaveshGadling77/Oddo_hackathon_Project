import { useState, useEffect, useCallback } from "react";
import { expenseAPI } from "../services/api";

export function useExpenses(initialParams = {}) {
  const [expenses, setExpenses] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [params,   setParams]   = useState(initialParams);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expenseAPI.listExpenses(params);
      setExpenses(data.expenses || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  const loadStats = useCallback(async () => {
    try {
      const data = await expenseAPI.getStats();
      setStats(data.stats || data);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  return { expenses, stats, loading, error, reload: load, loadStats, setParams };
}
