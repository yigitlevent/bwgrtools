import { ActionIcon, Group, Paper, Tooltip } from "@mantine/core";
import { BookOpen, ClipboardCheck, ClipboardList, Database, LogIn, LogOut, BookOpenCheck } from "lucide-react";
import { Fragment, useState } from "react";

import { Checklist } from "./Drawers/Checklist";
import { RulesetSelector } from "./Drawers/RulesetSelector";
import { Tools } from "./Drawers/Tools";
import { Signin } from "./Signin/Signin";
import { Signup } from "./Signup/Signup";
import { useUserStore } from "../../hooks/apiStores/useUserStore";
import { useDrawerStore } from "../../hooks/useDrawerStore";

import type { DrawerNames } from "../../hooks/useDrawerStore";


function DrawerIconButton({ title, icon, onClick }: { title: string; icon: React.JSX.Element; onClick: () => void; }): React.JSX.Element {
  return (
    <Tooltip label={title}>
      <ActionIcon mt={16} p={4} variant="subtle" onClick={() => { onClick(); }}>{icon}</ActionIcon>
    </Tooltip>
  );
}

export function Menu({ bottom }: { bottom: boolean; }): React.JSX.Element {
  const { drawer } = useDrawerStore();
  const { user, signout } = useUserStore();
  const { toggleDrawer } = useDrawerStore();

  const [signinOpen, setSigninOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const buttons: { title: DrawerNames; icon: React.JSX.Element; authOnly: boolean; }[] = [
    { title: "Tools", icon: <ClipboardList />, authOnly: false },
    { title: "Datasets", icon: <Database />, authOnly: false },
    { title: "Checklist", icon: <ClipboardCheck />, authOnly: false },
    { title: "My Things", icon: <BookOpen />, authOnly: true }
  ];

  return (
    <Group
      align="center"
      justify={bottom ? "center" : "flex-end"}
      style={bottom ? {
        position: "fixed", width: "100%", left: 0, bottom: 0,
        padding: 0, background: "var(--mantine-color-body)", zIndex: 123456789
      } : undefined}
    >
      {user ? <DrawerIconButton title="Sign out" icon={<LogOut />} onClick={signout} /> : (
        <Fragment>
          <DrawerIconButton title="Sign in" icon={<LogIn />} onClick={() => { setSigninOpen(true); }} />
          <DrawerIconButton title="Sign up" icon={<BookOpenCheck />} onClick={() => { setSignupOpen(true); }} />
        </Fragment>
      )}

      {buttons.reverse()
        .filter(v => !v.authOnly || user)
        .map((v, i) => <DrawerIconButton key={i} title={v.title} icon={v.icon} onClick={() => { toggleDrawer(v.title); }} />)}

      <Signin open={signinOpen} handleClose={() => { setSigninOpen(false); }} />
      <Signup open={signupOpen} handleClose={() => { setSignupOpen(false); }} />
      <Tools expanded={drawer === "Tools"} />
      <RulesetSelector expanded={drawer === "Datasets"} />
      <Checklist expanded={drawer === "Checklist"} />
      {/* <MyThings expanded={drawer === "My Things"} /> */}
    </Group>
  );
}
