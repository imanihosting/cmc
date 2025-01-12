import { UserPublicMetadata } from "@clerk/types";

declare module "@clerk/types" {
  export interface UserPublicMetadata {
    onboardingComplete?: boolean;
    role?: string;
  }
}
