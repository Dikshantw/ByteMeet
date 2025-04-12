import React from "react";

const avatars = ["🧑", "👩", "👾", "🤖", "🐱", "🐶", "🐸"];

interface AvatarSelectorProps {
  onSelect: (avatar: string) => void;
  selected: string | null;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  onSelect,
  selected,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {avatars.map((avatar) => (
        <button
          key={avatar}
          onClick={() => onSelect(avatar)}
          className={`
            rounded-lg border-2 border-gray-300 bg-white p-2 text-3xl hover:border-blue-500
            ${selected === avatar ? "border-blue-500 bg-blue-100" : ""}
          `}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
};
