const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center py-4 px-4 max-w-screen-2xl mx-auto">
      {children}
    </main>
  );
};

export default AuthLayout;
