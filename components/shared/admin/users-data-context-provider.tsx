"use client";

import React, { createContext, useContext, useState } from "react";

import { Role, User } from "@/db/schemas";

interface UsersDataWrapperProps {
  children: React.ReactNode;
}

const UsersDataContext = createContext<{
  users: (User & { region: string })[] | User[];
  setUsers: (users: (User & { region: string })[] | User[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  role: Role | null;
  setRole: (role: Role) => void;
}>({
  users: [],
  setUsers: () => {},
  role: Role.USER,
  setRole: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

const UsersDataContextProvider = ({ children }: UsersDataWrapperProps) => {
  const [users, setUsers] = useState<(User & { region: string })[] | User[]>(
    []
  );
  const [role, setRole] = useState<Role>(Role.USER);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <UsersDataContext.Provider
      value={{ users, setUsers, role, setRole, isLoading, setIsLoading }}
    >
      {children}
    </UsersDataContext.Provider>
  );
};

export default UsersDataContextProvider;

export const useUsersData = () => {
  const context = useContext(UsersDataContext);
  if (!context) {
    throw new Error(
      "useUsersData must be used within a UsersDataContextProvider"
    );
  }
  return context;
};
