import { useState, useEffect } from "react";

export type Role = "ADMIN" | "AGENT" | "CUSTOMER";

export function useRole() {
  const [role, setRole] = useState<Role>(() => {
    // localStorage'dan role'ü al, yoksa default olarak CUSTOMER
    const savedRole = localStorage.getItem('userRole') as Role;
    return savedRole || "CUSTOMER";
  });

  // Role değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  return { role, setRole };
}