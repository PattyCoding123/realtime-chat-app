import { ClerkProvider } from "@clerk/nextjs/app-beta";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <ClerkProvider>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </ClerkProvider>
    </>
  );
};

export default Providers;
