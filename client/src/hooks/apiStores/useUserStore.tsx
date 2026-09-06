import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { RequestAuth, RequestSignIn, RequestSignOut, RequestSignUp } from "../../utils/Fetch";


interface EmailPasswordForm { email: string; password: string; }

interface UserState {
  user: UserSession | undefined;
  fetching: boolean;
  triedAuth: boolean;
  setUser: (user: UserSession | undefined) => void;
  toggleFetching: () => void;
  auth: () => void;
  signup: (formData: EmailPasswordForm, handleClose: (open: boolean) => void) => void;
  signin: (formData: EmailPasswordForm, handleClose: (open: boolean) => void) => void;
  signout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: undefined,
      fetching: false,
      triedAuth: false,

      setUser: (user: UserSession | undefined) => {
        set(produce<UserState>(state => { state.user = user; }));
      },

      toggleFetching: () => {
        set(produce<UserState>(state => { state.fetching = !state.fetching; }));
      },

      auth: () => {
        if (!get().triedAuth) {
          set(produce<UserState>(state => { state.triedAuth = true; }));

          const state = get();

          state.toggleFetching();

          RequestAuth()
            .then(response => { state.setUser(response.user); })
            .catch(() => { state.setUser(undefined); })
            .finally(() => { state.toggleFetching(); });
        }
      },

      signup: (formData: EmailPasswordForm, handleClose: (open: boolean) => void) => {
        const state = get();

        state.toggleFetching();

        RequestSignUp(formData)
          .then(response => {
            state.setUser(response.user);
            handleClose(true);
          })
          .catch((reason: unknown) => { console.error(reason); })
          .finally(() => { state.toggleFetching(); });
      },

      signin: (formData: EmailPasswordForm, handleClose: (open: boolean) => void) => {
        const state = get();

        state.toggleFetching();

        RequestSignIn(formData)
          .then(response => {
            state.setUser(response.user);
            handleClose(true);
          })
          .catch((reason: unknown) => { console.error(reason); })
          .finally(() => { state.toggleFetching(); });
      },

      signout: () => {
        const state = get();

        state.toggleFetching();

        RequestSignOut()
          .then(() => { state.setUser(undefined); })
          .catch((reason: unknown) => { console.error(reason); })
          .finally(() => { state.toggleFetching(); });
      }
    }),
    { name: "useUserStore" }
  )
);
