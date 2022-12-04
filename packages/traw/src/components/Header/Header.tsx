import React, { ReactNode } from "react";
import Logo from "../../icons/Logo";
import Title from "./Title";

interface HeaderProps {
  // Title
  title: string;
  canEdit: boolean;
  handleChangeTitle: (name: string) => void;

  // Room
  Room: ReactNode;
}

const Header = ({ title, canEdit, handleChangeTitle, Room }: HeaderProps) => {
  return (
    <div className="flex flex-row h-14 pl-3 bg-white items-center">
      <button className="flex h-9 w-9 rounded-full bg-white items-center justify-center text-xl hover:bg-traw-sky">
        <Logo />
      </button>
      <div className="ml-2">
        <Title
          title={title}
          canEdit={canEdit}
          handleChangeTitle={handleChangeTitle}
        />
      </div>
      <div className="flex flex-grow justify-end">{Room}</div>
    </div>
  );
};

export { Header };
