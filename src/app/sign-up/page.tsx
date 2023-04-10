import { SignUp } from "@clerk/nextjs/app-beta";

export default function Page() {
  return <SignUp signInUrl="/sign-in" redirectUrl={"/api/check-id"} />;
}