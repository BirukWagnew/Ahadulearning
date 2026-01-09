import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const UserAvatar = ({ getUserInitials, className, src, alt }) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [src]);

  return (
    <Button
      variant="ghost"
      className={`relative h-24 w-24 rounded-full ${className || ""}`}
      size="icon"
    >
      <Avatar className="h-24 w-24">
        {src && !imgFailed ? (
          <AvatarImage src={src} alt={alt || "User avatar"} onError={() => setImgFailed(true)} />
        ) : null}
        <AvatarFallback className="bg-fidel-100 text-fidel-700 dark:bg-fidel-900 dark:text-fidel-300 text-4xl font-bold">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default UserAvatar;
